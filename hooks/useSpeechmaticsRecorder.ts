"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "stopping" | "done" | "error";

export interface RecorderResult {
  state: RecorderState;
  transcript: string;
  partialTranscript: string;
  elapsed: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

interface SpeechmaticsResult {
  type: string;
  start_time: number;
  end_time: number;
  alternatives?: Array<{ content: string; confidence?: number }>;
}

interface SpeechmaticsMsg {
  message: string;
  metadata?: { transcript?: string };
  results?: SpeechmaticsResult[];
}

interface Token {
  content: string;
  isPunct: boolean;
}

function floatToPCM16(float32: Float32Array): ArrayBuffer {
  const buf = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buf;
}

/** Average-decimate from the device's native rate down to 16 kHz. */
function downsample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate <= toRate) return input;
  const ratio = fromRate / toRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), input.length);
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += input[j];
      count++;
    }
    out[i] = count ? sum / count : 0;
  }
  return out;
}

/** Rebuild the transcript from the dedup'd token map, sorted by start time. */
function buildTranscript(map: Map<number, Token>): string {
  const sorted = [...map.entries()].sort((a, b) => a[0] - b[0]);
  let text = "";
  for (const [, tok] of sorted) {
    if (!tok.content) continue;
    text += tok.isPunct ? tok.content : (text ? " " : "") + tok.content;
  }
  return text;
}

export function useSpeechmaticsRecorder(): RecorderResult {
  const [state, setState] = useState<RecorderState>("idle");
  const [transcript, setTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef("");
  // Dedup'd tokens keyed by start_time(ms). Overlapping AddTranscript events
  // from the enhanced sliding-window model re-send the same start_time, which
  // simply overwrites — no doubling.
  const tokensRef = useRef<Map<number, Token>>(new Map());
  const stoppingRef = useRef(false);
  const finishedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (stoppingRef.current || finishedRef.current) return;
    stoppingRef.current = true;
    setState("stopping");

    cleanup(); // stop capturing/sending audio; keep WS open for final transcripts

    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message: "EndOfStream", last_seq_no: 0 }));
      // Fallback: if EndOfTranscript never arrives, finish anyway after 4s.
      finishTimeoutRef.current = setTimeout(() => {
        finishedRef.current = true;
        try {
          ws.close(1000);
        } catch {}
        setState("done");
      }, 4000);
    } else {
      finishedRef.current = true;
      setState("done");
    }
  }, [cleanup]);

  useEffect(() => {
    if (elapsed >= 60 && state === "recording") {
      stop();
    }
  }, [elapsed, state, stop]);

  const start = useCallback(async () => {
    if (wsRef.current) return; // guard against double-start

    if (!navigator.onLine) {
      setError("Speechmatics needs a connection to transcribe. Reconnect and try again.");
      setState("error");
      return;
    }

    setError(null);
    setTranscript("");
    setPartialTranscript("");
    setElapsed(0);
    transcriptRef.current = "";
    tokensRef.current.clear();
    stoppingRef.current = false;
    finishedRef.current = false;

    let token: string;
    try {
      const res = await fetch("/api/speechmatics-token", { method: "POST" });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!data.token) throw new Error(data.error ?? "no_token");
      token = data.token;
    } catch {
      setError("Could not get transcription token. Check your Speechmatics key.");
      setState("error");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access denied.");
      setState("error");
      return;
    }
    streamRef.current = stream;

    const ws = new WebSocket(`wss://eu2.rt.speechmatics.com/v2?jwt=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          message: "StartRecognition",
          audio_format: { type: "raw", encoding: "pcm_s16le", sample_rate: 16000 },
          transcription_config: {
            language: "en",
            operating_point: "enhanced",
            enable_partials: true,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data as string) as SpeechmaticsMsg;

      if (msg.message === "RecognitionStarted") {
        setState("recording");
        // Use the device's native sample rate, then downsample manually —
        // Safari ignores the AudioContext sampleRate hint.
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const inputRate = audioCtx.sampleRate;

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const input = e.inputBuffer.getChannelData(0);
          const ds = downsample(input, inputRate, 16000);
          ws.send(floatToPCM16(ds));
        };

        source.connect(processor);
        // Route to a muted gain node so the processor runs without echoing
        // the mic back through the speakers.
        const sink = audioCtx.createGain();
        sink.gain.value = 0;
        processor.connect(sink);
        sink.connect(audioCtx.destination);

        timerRef.current = setInterval(() => {
          setElapsed((n) => n + 1);
        }, 1000);
      }

      if (msg.message === "AddPartialTranscript" && msg.metadata?.transcript) {
        setPartialTranscript(msg.metadata.transcript);
      }

      if (msg.message === "AddTranscript") {
        for (const r of msg.results ?? []) {
          if (r.type !== "word" && r.type !== "punctuation") continue;
          const content = r.alternatives?.[0]?.content ?? "";
          tokensRef.current.set(Math.round(r.start_time * 1000), {
            content,
            isPunct: r.type === "punctuation",
          });
        }
        transcriptRef.current = buildTranscript(tokensRef.current);
        setTranscript(transcriptRef.current);
        setPartialTranscript("");
      }

      if (msg.message === "EndOfTranscript") {
        if (finishTimeoutRef.current) {
          clearTimeout(finishTimeoutRef.current);
          finishTimeoutRef.current = null;
        }
        finishedRef.current = true;
        setState("done");
        try {
          ws.close(1000);
        } catch {}
      }
    };

    ws.onerror = () => {
      cleanup();
      if (!finishedRef.current && !stoppingRef.current) {
        setError("WebSocket error. Please try again.");
        setState("error");
      }
    };

    ws.onclose = () => {
      cleanup();
      wsRef.current = null;
      if (finishTimeoutRef.current) {
        clearTimeout(finishTimeoutRef.current);
        finishTimeoutRef.current = null;
      }
      // Only a genuine unexpected close (not our own EndOfStream / EndOfTranscript).
      if (!finishedRef.current && !stoppingRef.current) {
        setError("Connection closed unexpectedly.");
        setState("error");
      } else if (stoppingRef.current && !finishedRef.current) {
        // We asked to stop and the socket closed before EndOfTranscript — finish cleanly.
        finishedRef.current = true;
        setState("done");
      }
    };
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;
    setState("idle");
    setTranscript("");
    setPartialTranscript("");
    setElapsed(0);
    setError(null);
    transcriptRef.current = "";
    tokensRef.current.clear();
    stoppingRef.current = false;
    finishedRef.current = false;
  }, [cleanup]);

  return { state, transcript, partialTranscript, elapsed, error, start, stop, reset };
}
