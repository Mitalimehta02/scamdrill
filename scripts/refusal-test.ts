// npm run test:refusal
// Runs all 10 stages (plus one silence nudge) against the live provider and prints each line,
// whether it passed the output check, the classifier's tactic, latency and tokens.
// Pass bar (devpost/checklist.md, slice 1): ≥ 8/10 stages in character, and the classifier returns valid tactics.

import "dotenv/config";
import { classifyTactic, generateScammerLine, type HistoryTurn } from "../server/llm";
import { NUDGE_BEAT, NUDGE_TACTIC, STAGE_COUNT, STAGES } from "../src/drill/script";

// Scripted parent replies, in placeholder form, like the real app would send.
const PARENT_REPLIES = [
  "Hello? Who is this?",
  "What? I haven't done anything wrong.",
  "Arrest? Please, I am an old person.",
  "Can I at least call my son and ask?",
  "Why do you need a code from my phone?",
  "Please don't involve my family.",
  "I don't have that kind of money.",
  "I'm not sure about this.",
  "Can I call you back later?",
  "I need to think about it.",
];

// Stay under the free tier's 8,000 tokens/minute per model.
const PAUSE_MS = 4000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!process.env.AI_API_KEY) {
    console.error("AI_API_KEY is missing. Copy .env.example to .env and add your key.");
    process.exit(1);
  }
  console.log(`Provider: ${process.env.AI_BASE_URL || "https://api.groq.com/openai/v1"}\n`);

  const history: HistoryTurn[] = [];
  let passed = 0;
  let validTactics = 0;
  let classified = 0;
  const latencies: number[] = [];

  const run = async (label: string, stage: number, beat: string, nudge: boolean) => {
    const planned = nudge ? NUDGE_TACTIC : STAGES[stage].plannedTactic;
    const line = await generateScammerLine(stage, beat, history, nudge);
    if (line.meta) latencies.push(line.meta.ms);
    if ("text" in line) {
      const tag = await classifyTactic(line.text);
      classified++;
      if ("tactic" in tag) validTactics++;
      console.log(`${label}  PASS  ${line.meta.ms}ms  ${line.meta.promptTokens}+${line.meta.completionTokens} tok`);
      console.log(`   Sharma: ${line.text}`);
      console.log(`   Tactic: ${"tactic" in tag ? tag.tactic : `FALLBACK (${tag.reason})`}  [planned ${planned}]`);
      return line.text;
    }
    console.log(`${label}  FALLBACK  (${line.reason})`);
    console.log(`   Canned: ${STAGES[stage].cannedLine}`);
    return null;
  };

  for (let stage = 1; stage <= STAGE_COUNT; stage++) {
    const text = await run(`Stage ${String(stage).padStart(2)}`, stage, STAGES[stage].beat, false);
    if (text) passed++;
    history.push({ role: "scammer", text: text ?? STAGES[stage].cannedLine });
    history.push({ role: "parent", text: PARENT_REPLIES[stage - 1] });
    console.log(`   Parent: ${PARENT_REPLIES[stage - 1]}\n`);
    await sleep(PAUSE_MS);
  }

  history.pop(); // the nudge happens after silence, so drop the last parent reply
  await run("Nudge   ", 10, NUDGE_BEAT, true);

  const sorted = [...latencies].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  console.log(`\nStages in character: ${passed}/${STAGE_COUNT}`);
  console.log(`Classifier valid:    ${validTactics}/${classified}`);
  console.log(`Scammer latency:     median ${median}ms, max ${sorted[sorted.length - 1] ?? 0}ms`);
  const ok = passed >= 8 && classified > 0 && validTactics === classified;
  console.log(ok ? "\nRESULT: PASS" : "\nRESULT: FAIL — adjust server/prompts.ts framing, or switch .env to the Gemini backup.");
  process.exit(ok ? 0 : 1);
}

main();
