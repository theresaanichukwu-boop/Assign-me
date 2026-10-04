// AI composer client — server-side only. Never import from client components.
// OpenAI-compatible chat completions (works with Gemini's OpenAI endpoint,
// or any provider via AI_BASE_URL). Key stays in server env, never logged.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function config() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error("AI_API_KEY is not set");
  return {
    apiKey,
    baseUrl: (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, ""),
    model: process.env.AI_MODEL ?? "gemini-2.0-flash",
  };
}

export async function complete(
  messages: ChatMessage[],
  opts?: { model?: string; maxTokens?: number; temperature?: number },
): Promise<string> {
  const { apiKey, baseUrl, model } = config();
  const r = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts?.model ?? model,
      messages,
      max_tokens: opts?.maxTokens ?? 1200,
      temperature: opts?.temperature ?? 0.7,
    }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`AI provider error (${r.status}): ${detail.slice(0, 200)}`);
  }
  const data = (await r.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("AI provider returned no content.");
  return content;
}
