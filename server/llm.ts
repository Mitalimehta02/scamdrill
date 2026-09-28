// The only place that talks to the AI provider. Groq by default; Gemini via .env only.
// Every failure becomes { fallback: true } so the browser uses the canned line or planned tactic.
// See spec.md > Server: LLM Client.

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { isTactic, type Tactic } from "../src/drill/tactics";
import { CLASSIFIER_SYSTEM, SCAMMER_SYSTEM, scammerBeatInstruction } from "./prompts";

export interface HistoryTurn {
  role: "scammer" | "parent";
  text: string; // placeholder form only — real names never reach the server
}

export interface CallMeta {
  model: string;
  ms: number;
  promptTokens?: number;
  completionTokens?: number;
}

export type LineResult = { text: string; meta: CallMeta } | { fallback: true; reason: string; meta?: CallMeta };
export type TacticResult = { tactic: Tactic; meta: CallMeta } | { fallback: true; reason: string; meta?: CallMeta };

const TIMEOUT_MS = 8000;
const HISTORY_LIMIT = 6;

// ---------- Output check (pure, unit-tested) ----------

const REFUSAL = /\b(I can(?:'|’)?t|I cannot|I(?:'|’)m sorry|I am sorry|as an AI|I won(?:'|’)t|I(?:'|’)m unable|I am unable|I must decline)\b/i;
const URL = /(https?:\/\/|www\.|\b[\w-]+\.(?:com|in|org|net|gov|co)\b)/i;
const KNOWN_PLACEHOLDERS = new Set(["PARENT", "BANK", "GRANDCHILD", "SAFE_CONTACT", "AMOUNT", "ACCOUNT"]);

export function checkScammerOutput(text: string): { ok: true } | { ok: false; reason: string } {
  const t = text.trim();
  if (!t) return { ok: false, reason: "empty" };
  if (REFUSAL.test(t)) return { ok: false, reason: "refusal" };
  // Join digit groups split by commas, spaces, dots or dashes ("2,50,000", "0042 7781") before counting.
  const joined = t.replace(/(?<=\d)[,\s.\-](?=\d)/g, "");
  if (/\d{6,}/.test(joined)) return { ok: false, reason: "digits" };
  if (URL.test(t)) return { ok: false, reason: "link" };
  if (t.split(/\s+/).length > 80) return { ok: false, reason: "too long" };
  // A misspelled placeholder like {GRUNDCHILD} would silently drop the family's detail on screen.
  for (const [, name] of t.matchAll(/\{([^}]*)\}/g)) {
    if (!KNOWN_PLACEHOLDERS.has(name)) return { ok: false, reason: "unknown placeholder" };
  }
  return { ok: true };
}

/** Removes wrapper quotes or a "Inspector Sharma:" label the model sometimes adds. */
export function tidyLine(text: string): string {
  return text
    .trim()
    .replace(/^(\*\*)?(inspector\s+)?sharma(\*\*)?\s*:\s*/i, "")
    .replace(/^["“](.*)["”]$/s, "$1")
    .trim();
}

// ---------- Provider calls ----------

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    if (!process.env.AI_API_KEY) throw new Error("AI_API_KEY is not set");
    client = new OpenAI({
      apiKey: process.env.AI_API_KEY,
      baseURL: process.env.AI_BASE_URL || "https://api.groq.com/openai/v1",
      timeout: TIMEOUT_MS,
      maxRetries: 0,
    });
  }
  return client;
}

// Groq reasoning params for gpt-oss (console.groq.com/docs/reasoning).
// include_reasoning isn't in the OpenAI SDK's types, but the SDK passes extra body fields through.
// Never send reasoning_format: it isn't supported for gpt-oss.
const REASONING = { reasoning_effort: "low" as const, include_reasoning: false };

function log(kind: string, meta: CallMeta, result: string) {
  // Never log message content — only what's needed for the cost/latency picture.
  console.log(JSON.stringify({ kind, ...meta, result }));
}

export async function generateScammerLine(
  stage: number,
  beat: string,
  history: HistoryTurn[],
  nudge = false,
): Promise<LineResult> {
  const model = process.env.SCAMMER_MODEL || "openai/gpt-oss-120b";
  const recent = history.slice(-HISTORY_LIMIT);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: `${SCAMMER_SYSTEM}\n\n${scammerBeatInstruction(stage, beat)}` },
    ...recent.map((h): ChatCompletionMessageParam =>
      h.role === "scammer" ? { role: "assistant", content: h.text } : { role: "user", content: h.text },
    ),
  ];
  if (nudge) messages.push({ role: "user", content: "(silence — the user has not replied)" });
  else if (recent.length === 0 || recent[recent.length - 1].role !== "parent")
    messages.push({ role: "user", content: "(the user has just picked up the call)" });

  const start = Date.now();
  try {
    const res = await getClient().chat.completions.create({
      model,
      messages,
      max_completion_tokens: 300,
      ...REASONING,
    } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);
    const meta: CallMeta = {
      model,
      ms: Date.now() - start,
      promptTokens: res.usage?.prompt_tokens,
      completionTokens: res.usage?.completion_tokens,
    };
    const text = tidyLine(res.choices[0]?.message?.content ?? "");
    const check = checkScammerOutput(text);
    if (!check.ok) {
      log("scammer", meta, `fallback:${check.reason}`);
      return { fallback: true, reason: check.reason, meta };
    }
    log("scammer", meta, "ok");
    return { text, meta };
  } catch (err) {
    const meta = { model, ms: Date.now() - start };
    const reason = err instanceof Error ? err.message : String(err);
    log("scammer", meta, `fallback:error`);
    return { fallback: true, reason, meta };
  }
}

/** Pulls {"tactic": "..."} out of the model's reply and checks it against the tactic list. */
export function parseTactic(content: string): Tactic | null {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const value = String(JSON.parse(match[0]).tactic ?? "").trim().toUpperCase();
    return isTactic(value) ? value : null;
  } catch {
    return null;
  }
}

export async function classifyTactic(text: string): Promise<TacticResult> {
  const model = process.env.CLASSIFIER_MODEL || "openai/gpt-oss-20b";
  const start = Date.now();
  const request = (jsonMode: boolean) =>
    getClient().chat.completions.create({
      model,
      messages: [
        { role: "system", content: CLASSIFIER_SYSTEM },
        { role: "user", content: text },
      ],
      max_completion_tokens: 100,
      ...(jsonMode ? { response_format: { type: "json_object" as const } } : {}),
      ...REASONING,
    } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming);

  try {
    let res;
    let promptOnly = false;
    try {
      res = await request(true);
    } catch (err) {
      // Groq sometimes returns 400 when JSON mode output fails its validation.
      // Retry this one call with JSON requested in the prompt only; parseTactic still validates it.
      if (err instanceof OpenAI.APIError && err.status === 400) {
        promptOnly = true;
        res = await request(false);
      } else throw err;
    }
    const meta: CallMeta = {
      model,
      ms: Date.now() - start,
      promptTokens: res.usage?.prompt_tokens,
      completionTokens: res.usage?.completion_tokens,
    };
    const tactic = parseTactic(res.choices[0]?.message?.content ?? "");
    if (!tactic) {
      log("classify", meta, "fallback:invalid");
      return { fallback: true, reason: "invalid tactic", meta };
    }
    log("classify", meta, `ok:${tactic}${promptOnly ? " (prompt-only JSON retry)" : ""}`);
    return { tactic, meta };
  } catch (err) {
    const meta = { model, ms: Date.now() - start };
    log("classify", meta, "fallback:error");
    return { fallback: true, reason: err instanceof Error ? err.message : String(err), meta };
  }
}
