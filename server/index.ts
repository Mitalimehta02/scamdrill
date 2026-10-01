// The small server that keeps the API key secret. Two doors: /api/scammer and /api/classify.
// AI failures never become error statuses — they become { fallback: true } (spec.md > Server: API Routes).

import "dotenv/config";
import express from "express";
import { classifyTactic, generateScammerLine } from "./llm";
import { parseHistory } from "./validate";
import { SERVER_BODY_LIMIT_BYTES, SERVER_MAX_TEXT } from "../src/drill/limits";
import { NUDGE_BEAT, STAGE_COUNT, STAGES } from "../src/drill/script";
import type { Lang } from "../src/i18n/strings";

const LANGS: Lang[] = ["en", "hi", "hinglish"];

const app = express();
// 12 kB: Hindi text is 3 bytes per character in UTF-8, so 6 turns of history can pass 4 kB.
app.use(express.json({ limit: SERVER_BODY_LIMIT_BYTES }));

app.post("/api/scammer", async (req, res) => {
  const { stage, history, nudge, language } = req.body ?? {};
  const lang: Lang = LANGS.includes(language) ? language : "en";
  const turns = parseHistory(history);
  if (!Number.isInteger(stage) || stage < 1 || stage > STAGE_COUNT || !turns) {
    res.status(400).json({ fallback: true });
    return;
  }
  const beat = nudge ? NUDGE_BEAT : STAGES[stage].beat;
  const result = await generateScammerLine(stage, beat, turns, !!nudge, lang);
  res.json("text" in result ? { text: result.text } : { fallback: true });
});

app.post("/api/classify", async (req, res) => {
  const { text } = req.body ?? {};
  if (typeof text !== "string" || !text.trim() || text.length > SERVER_MAX_TEXT) {
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
