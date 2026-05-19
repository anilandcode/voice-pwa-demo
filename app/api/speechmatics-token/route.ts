export const runtime = "edge";

export async function POST() {
  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "missing_api_key" }, { status: 500 });
  }

  const res = await fetch("https://mp.speechmatics.com/v1/api_keys?type=rt", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ttl: 3600 }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Speechmatics token error:", text);
    return Response.json({ error: "token_fetch_failed" }, { status: 502 });
  }

  const data = (await res.json()) as { key_value: string };
  return Response.json({ token: data.key_value });
}
