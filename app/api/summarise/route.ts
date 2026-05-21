import OpenAI from "openai";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are a voice note analyser. Return ONLY a valid JSON object — no markdown fences, no explanation, no preamble.

Required schema exactly:
{"summary":"<string, max 2 lines, approximately 25 words>","tags":["<tag1>","<tag2>","<tag3>"],"mood":"neutral"}

The mood field must be exactly one of: neutral, positive, reflective, urgent.
Tags must be exactly 3 short lowercase strings (1-2 words each).
Do not include any text outside the JSON object.`;

export async function POST(req: NextRequest) {
  const { transcript, audioDurationSec, recordedAt } = (await req.json()) as {
    transcript: string;
    audioDurationSec: number;
    recordedAt: string;
  };

  if (!transcript?.trim()) {
    return Response.json(
      { summary: "No speech detected.", tags: ["empty", "voice", "note"], mood: "neutral" },
      { status: 200 }
    );
  }

  // Instantiate inside the handler so the SDK never runs during `next build`
  // (build-time env vars are not set; module-level instantiation throws).
  const client = new OpenAI({
    apiKey: process.env.VULTR_API_KEY,
    baseURL: process.env.VULTR_INFERENCE_URL ?? "https://api.vultrinference.com/v1",
  });

  const model = process.env.VULTR_MODEL ?? "llama-3.1-70b-instruct-fp8";

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Transcript: ${transcript}\nDuration: ${audioDurationSec}s\nRecorded: ${recordedAt}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw) as {
    summary: string;
    tags: string[];
    mood: "neutral" | "positive" | "reflective" | "urgent";
  };

  return Response.json(parsed);
}
