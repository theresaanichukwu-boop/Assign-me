// AI composer client — server-side only. Never import from client components.
// Native Gemini API (x-goog-api-key). New-format keys and current models do not
// work through the OpenAI-compatible endpoint for this account, so we call
// :generateContent directly. Same complete() interface; callers are unaffected.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

function config() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error("AI_API_KEY is not set");
  return { apiKey, model: process.env.AI_MODEL ?? "gemini-3-flash-preview" };
}

export async function complete(
  messages: ChatMessage[],
  opts?: { model?: string; maxTokens?: number; temperature?: number },
): Promise<string> {
  const { apiKey, model } = config();
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const r = await fetch(
    `${BASE_URL}/models/${encodeURIComponent(opts?.model ?? model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: {
          maxOutputTokens: opts?.maxTokens ?? 1200,
          temperature: opts?.temperature ?? 0.7,
        },
      }),
    },
  );
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`AI provider error (${r.status}): ${detail.slice(0, 200)}`);
  }
  const data = (await r.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!content) throw new Error("AI provider returned no content.");
  return content;
}
