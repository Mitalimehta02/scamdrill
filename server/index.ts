// The small server that keeps the API key secret. Two doors: /api/scammer and /api/classify.
// AI failures never become error statuses — they become { fallback: true } (spec.md > Server: API Routes).

import "dotenv/config";
import express from "express";
import { classifyTactic, generateScammerLine, type HistoryTurn } from "./llm";
import { NUDGE_BEAT, STAGE_COUNT, STAGES } from "../src/drill/script";

const app = express();
app.use(express.json({ limit: "4kb" }));

function parseHistory(value: unknown): HistoryTurn[] | null {
  if (!Array.isArray(value) || value.length > 30) return null;
  const turns: HistoryTurn[] = [];
  for (const item of value) {
    if (!item || (item.role !== "scammer" && item.role !== "parent")) return null;
    if (typeof item.text !== "string" || item.text.length > 600) return null;
    turns.push({ role: item.role, text: item.text });
  }
  return turns;
}

app.post("/api/scammer", async (req, res) => {
  const { stage, history, nudge } = req.body ?? {};
  const turns = parseHistory(history);
  if (!Number.isInteger(stage) || stage < 1 || stage > STAGE_COUNT || !turns) {
    res.status(400).json({ fallback: true });
    return;
  }
  const beat = nudge ? NUDGE_BEAT : STAGES[stage].beat;
  const result = await generateScammerLine(stage, beat, turns, !!nudge);
  res.json("text" in result ? { text: result.text } : { fallback: true });
});

app.post("/api/classify", async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || !text.trim() || text.length > 600) {
    res.status(400).json({ fallback: true });
    return;
  }
  const result = await classifyTactic(text);
  res.json("tactic" in result ? { tactic: result.tactic } : { fallback: true });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, provider: process.env.AI_BASE_URL || "https://api.groq.com/openai/v1", keySet: !!process.env.AI_API_KEY });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`ScamDrill API on http://localhost:${port}`));
