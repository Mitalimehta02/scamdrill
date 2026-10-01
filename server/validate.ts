// Request validation for /api/scammer, kept separate from the Express app so it can be unit-tested.

import type { HistoryTurn } from "./llm";
import { SERVER_MAX_TEXT } from "../src/drill/limits";

export function parseHistory(value: unknown): HistoryTurn[] | null {
  if (!Array.isArray(value) || value.length > 30) return null;
  const turns: HistoryTurn[] = [];
  for (const item of value) {
    if (!item || (item.role !== "scammer" && item.role !== "parent")) return null;
    if (typeof item.text !== "string" || item.text.length > SERVER_MAX_TEXT) return null;
    turns.push({ role: item.role, text: item.text });
  }
  return turns;
}
