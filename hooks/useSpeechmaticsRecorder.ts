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

function floatToPCM16(float32: Float32Array): ArrayBuffer {
  const buf = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buf;
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
  const transcriptRef = useRef("");
  const stoppingRef = useRef(false);

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
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    setState("stopping");

    cleanup();

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: "EndOfStream", last_seq_no: 0 }));
    } else {
      setState("done");
    }
  }, [cleanup]);

  useEffect(() => {
    if (elapsed >= 60 && state === "recording") {
      stop();
    }
  }, [elapsed, state, stop]);

  const start = useCallback(async () => {
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
    stoppingRef.current = false;

    let token: string;
    try {
      const res = await fetch("/api/speechmatics-token", { method: "POST" });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!data.token) throw new Error(data.error ?? "no_token");
      token = data.token;
    } catch (err) {
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
      const msg = JSON.parse(event.data as string) as {
        message: string;
        metadata?: { transcript?: string };
        results?: Array<{ alternatives?: Array<{ content: string }> }>;
      };

      if (msg.message === "RecognitionStarted") {
        setState("recording");
        const audioCtx = new AudioContext({ sampleRate: 16000 });
        audioCtxRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(2048, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const pcm = floatToPCM16(e.inputBuffer.getChannelData(0));
          ws.send(pcm);
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);

        timerRef.current = setInterval(() => {
          setElapsed((n) => n + 1);
        }, 1000);
      }

      if (msg.message === "AddPartialTranscript" && msg.metadata?.transcript) {
        setPartialTranscript(msg.metadata.transcript);
      }

      if (msg.message === "AddTranscript" && msg.metadata?.transcript) {
        const chunk = msg.metadata.transcript;
        transcriptRef.current += (transcriptRef.current ? " " : "") + chunk;
        setTranscript(transcriptRef.current);
        setPartialTranscript("");
      }

      if (msg.message === "EndOfTranscript") {
        ws.close();
        setState("done");
        stoppingRef.current = false;
      }
    };

    ws.onerror = () => {
      cleanup();
      setError("WebSocket error. Please try again.");
      setState("error");
    };

    ws.onclose = (ev) => {
      cleanup();
      if (!stoppingRef.current && state !== "done") {
        if (ev.code !== 1000) {
          setError("Connection closed unexpectedly.");
          setState("error");
        }
      }
    };
  }, [cleanup, state]);

  const reset = useCallback(() => {
    cleanup();
    wsRef.current?.close();
    wsRef.current = null;
    setState("idle");
    setTranscript("");
    setPartialTranscript("");
    setElapsed(0);
    setError(null);
    transcriptRef.current = "";
    stoppingRef.current = false;
  }, [cleanup]);

  return { state, transcript, partialTranscript, elapsed, error, start, stop, reset };
}
