/**
 * Adapter LLM — satu pintu untuk semua agent AI Desk.
 *
 * Provider dipilih lewat env, sehingga API sendiri bisa dicolok tanpa ubah kode:
 *   AI_PROVIDER = "anthropic" | "openai"   (openai = format OpenAI-compatible:
 *                                           OpenAI, OpenRouter, gateway sendiri, dll.)
 *   AI_API_KEY  = kunci API
 *   AI_MODEL    = nama model (mis. claude-sonnet-..., gpt-..., atau model gateway)
 *   AI_BASE_URL = opsional; endpoint gateway sendiri
 *                 (default anthropic: https://api.anthropic.com,
 *                          openai:    https://api.openai.com/v1)
 *   AI_JSON_MODE = "off" bila gateway tidak mendukung response_format JSON
 *   AI_PRICE_IN_PER_MTOK / AI_PRICE_OUT_PER_MTOK = opsional, USD per 1 juta token
 *                 (untuk pelacak biaya di Ruang Redaksi AI)
 *
 * Bila AI_API_KEY kosong, isAiConfigured() = false dan agent memakai
 * jalur tanpa AI (rule-based) — sistem tetap jalan.
 */

export type LlmResult = {
  text: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
};

type Provider = "anthropic" | "openai";

function config() {
  const provider = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase() as Provider;
  return {
    provider: provider === "openai" ? "openai" : ("anthropic" as Provider),
    apiKey: process.env.AI_API_KEY ?? "",
    model: process.env.AI_MODEL ?? "",
    baseUrl: (process.env.AI_BASE_URL ?? "").replace(/\/+$/, ""),
    jsonMode: process.env.AI_JSON_MODE !== "off",
    priceIn: Number(process.env.AI_PRICE_IN_PER_MTOK) || 0,
    priceOut: Number(process.env.AI_PRICE_OUT_PER_MTOK) || 0,
  };
}

export function isAiConfigured(): boolean {
  const c = config();
  return Boolean(c.apiKey && c.model);
}

export function aiModelName(): string {
  return config().model;
}

/** Panggil LLM dengan system + user prompt, kembalikan teks mentah + pemakaian token. */
export async function complete(input: {
  system: string;
  user: string;
  maxTokens?: number;
  json?: boolean;
  timeoutMs?: number;
}): Promise<LlmResult> {
  const c = config();
  if (!c.apiKey || !c.model) throw new Error("AI belum dikonfigurasi (AI_API_KEY / AI_MODEL kosong)");
  const maxTokens = input.maxTokens ?? 2000;
  const signal = AbortSignal.timeout(input.timeoutMs ?? 90_000);

  let text = "";
  let tokensIn = 0;
  let tokensOut = 0;

  if (c.provider === "anthropic") {
    const res = await fetch(`${c.baseUrl || "https://api.anthropic.com"}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": c.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: c.model,
        max_tokens: maxTokens,
        system: input.system,
        messages: [{ role: "user", content: input.user }],
      }),
      signal,
    });
    if (!res.ok) throw new Error(`AI HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
    tokensIn = data.usage?.input_tokens ?? 0;
    tokensOut = data.usage?.output_tokens ?? 0;
  } else {
    const res = await fetch(`${c.baseUrl || "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${c.apiKey}`,
      },
      body: JSON.stringify({
        model: c.model,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
        ...(input.json && c.jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal,
    });
    if (!res.ok) throw new Error(`AI HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    text = data.choices?.[0]?.message?.content ?? "";
    tokensIn = data.usage?.prompt_tokens ?? 0;
    tokensOut = data.usage?.completion_tokens ?? 0;
  }

  const costUsd = (tokensIn * c.priceIn + tokensOut * c.priceOut) / 1_000_000;
  return { text, model: c.model, tokensIn, tokensOut, costUsd };
}

/** Ambil objek JSON pertama dari teks model (toleran terhadap ```json ... ```). */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Output AI bukan JSON");
  return JSON.parse(body.slice(start, end + 1));
}
