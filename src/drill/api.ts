// Browser → server calls, each with a timeout and a written-in-advance fallback.
// The parent never sees an error (spec.md > API Client).

import { NUDGE_LINE, NUDGE_TACTIC, STAGES } from "./script";
import { isTactic, type Tactic } from "./tactics";

export const SCAMMER_TIMEOUT_MS = 8000;
export const CLASSIFY_TIMEOUT_MS = 3000;
const HISTORY_LIMIT = 6;
const MIN_TYPING_MS = 900; // so a fast reply still shows the typing indicator briefly

type History = { role: "scammer" | "parent"; text: string }[];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Demo typing delay: ~1–2 s, longer for longer lines, so recordings feel like live mode. */
export function typingDelay(text: string): number {
  return Math.min(2000, 1000 + 15 * text.length);
}

export function isDemoMode(): boolean {
  if (import.meta.env.VITE_DEMO_ONLY === "true") return true;
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1";
}

type PostResult = { ok: true; data: Record<string, unknown> } | { ok: false; timedOut: boolean };

async function postJson(url: string, body: unknown, timeoutMs: number): Promise<PostResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, timedOut: false };
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, timedOut: controller.signal.aborted };
  } finally {
    clearTimeout(timer);
  }
}

export interface LineResult {
  text: string;
  /** True when the AI was tried and failed (counts toward "offline practice mode"). Never true in demo mode. */
  aiFailed: boolean;
}

export async function getScammerLine(
  stage: number,
  history: History,
  opts: { demo: boolean; nudge?: boolean },
): Promise<LineResult> {
  const canned = opts.nudge ? NUDGE_LINE : STAGES[stage].cannedLine;
  if (opts.demo) {
    await sleep(typingDelay(canned));
    return { text: canned, aiFailed: false };
  }
  const [result] = await Promise.all([
    postJson("/api/scammer", { stage, history: history.slice(-HISTORY_LIMIT), nudge: !!opts.nudge }, SCAMMER_TIMEOUT_MS),
    sleep(MIN_TYPING_MS),
  ]);
  if (result.ok && typeof result.data.text === "string" && result.data.text.trim()) {
    return { text: result.data.text, aiFailed: false };
  }
  return { text: canned, aiFailed: true };
}

// How often does the classifier miss its 3 s budget? Logged to the browser console during testing.
export const classifierStats = { calls: 0, ai: 0, timeouts: 0, invalidOrError: 0 };

export interface TagResult {
  tactic: Tactic;
  source: "ai" | "planned";
}

export async function classify(
  text: string,
  planned: Tactic,
  opts: { demo: boolean; nudge?: boolean },
): Promise<TagResult> {
  if (opts.nudge) return { tactic: NUDGE_TACTIC, source: "planned" }; // nudges are always ISOLATION
  if (opts.demo) {
    await sleep(400);
    return { tactic: planned, source: "planned" };
  }
  classifierStats.calls++;
  const result = await postJson("/api/classify", { text }, CLASSIFY_TIMEOUT_MS);
  let tag: TagResult;
  if (result.ok && isTactic(result.data.tactic)) {
    classifierStats.ai++;
    tag = { tactic: result.data.tactic, source: "ai" };
  } else {
    if (!result.ok && result.timedOut) classifierStats.timeouts++;
    else classifierStats.invalidOrError++;
    tag = { tactic: planned, source: "planned" };
  }
  console.info(
    `[classifier] ${tag.source === "ai" ? tag.tactic : `fallback → ${planned}`} · ` +
      `ai ${classifierStats.ai}/${classifierStats.calls}, timeouts ${classifierStats.timeouts}, invalid/error ${classifierStats.invalidOrError}`,
  );
  return tag;
}
