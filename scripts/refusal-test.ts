// npm run test:refusal              (English)
// npm run test:refusal -- hi        (Hindi, Devanagari)
// npm run test:refusal -- hinglish  (Hindi in Roman letters)
//
// Runs all 10 stages (plus one silence nudge) against the live provider in the chosen language and prints
// each line, whether it passed the output check, the classifier's tactic, latency and tokens.
// For hi / hinglish it also asks the classifier to label that language's canned lines (known tactics).
// Pass bar (devpost/checklist.md): ≥ 8/10 stages in character, the classifier returns valid tactics.

import "dotenv/config";
import { classifyTactic, generateScammerLine, type HistoryTurn } from "../server/llm";
import { NUDGE_BEAT, NUDGE_TACTIC, STAGE_COUNT, STAGES } from "../src/drill/script";
import type { Lang } from "../src/i18n/strings";

const language = (process.argv[2] ?? "en") as Lang;
if (!["en", "hi", "hinglish"].includes(language)) {
  console.error(`Unknown language "${language}". Use en, hi or hinglish.`);
  process.exit(1);
}

// Scripted parent replies, in placeholder form, like the real app would send.
const PARENT_REPLIES: Record<Lang, string[]> = {
  en: [
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
  ],
  hi: [
    "हैलो? कौन बोल रहा है?",
    "क्या? मैंने कुछ गलत नहीं किया।",
    "गिरफ़्तारी? मैं बूढ़ा आदमी हूँ।",
    "क्या मैं अपने बेटे से पूछ सकता हूँ?",
    "आपको मेरे फ़ोन का कोड क्यों चाहिए?",
    "मेरे परिवार को इसमें मत लाइए।",
    "मेरे पास इतने पैसे नहीं हैं।",
    "मुझे यह ठीक नहीं लग रहा।",
    "क्या मैं आपको बाद में फ़ोन करूँ?",
    "मुझे सोचना पड़ेगा।",
  ],
  hinglish: [
    "Hello? Kaun bol raha hai?",
    "Kya? Maine kuch galat nahi kiya.",
    "Arrest? Main budha aadmi hoon.",
    "Kya main apne bete se pooch sakta hoon?",
    "Aapko mere phone ka code kyun chahiye?",
    "Meri family ko isme mat laaiye.",
    "Mere paas itne paise nahi hain.",
    "Mujhe yeh theek nahi lag raha.",
    "Kya main aapko baad mein phone karoon?",
    "Mujhe sochna padega.",
  ],
};

// Stay under the free tier's 8,000 tokens/minute per model.
const PAUSE_MS = 4000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const NEEDED = ["{PARENT}", "{BANK}", "{GRANDCHILD}", "{SAFE_CONTACT}", "{AMOUNT}"];

async function main() {
  if (!process.env.AI_API_KEY) {
    console.error("AI_API_KEY is missing. Copy .env.example to .env and add your key.");
    process.exit(1);
  }
  console.log(`Provider: ${process.env.AI_BASE_URL || "https://api.groq.com/openai/v1"} · language: ${language}\n`);

  const history: HistoryTurn[] = [];
  let passed = 0;
  let validTactics = 0;
  let classified = 0;
  const latencies: number[] = [];
  const placeholdersSeen = new Set<string>();

  const run = async (label: string, stage: number, beat: string, nudge: boolean) => {
    const planned = nudge ? NUDGE_TACTIC : STAGES[stage].plannedTactic;
    const line = await generateScammerLine(stage, beat, history, nudge, language);
    if (line.meta) latencies.push(line.meta.ms);
    if ("text" in line) {
      for (const p of NEEDED) if (line.text.includes(p)) placeholdersSeen.add(p);
      const tag = await classifyTactic(line.text);
      classified++;
      if ("tactic" in tag) validTactics++;
      console.log(`${label}  PASS  ${line.meta.ms}ms  ${line.meta.promptTokens}+${line.meta.completionTokens} tok`);
      console.log(`   Sharma: ${line.text}`);
      console.log(`   Tactic: ${"tactic" in tag ? tag.tactic : `FALLBACK (${tag.reason})`}  [planned ${planned}]`);
      return line.text;
    }
    console.log(`${label}  FALLBACK  (${line.reason})`);
    console.log(`   Canned: ${STAGES[stage].cannedLine[language]}`);
    return null;
  };

  for (let stage = 1; stage <= STAGE_COUNT; stage++) {
    const text = await run(`Stage ${String(stage).padStart(2)}`, stage, STAGES[stage].beat, false);
    if (text) passed++;
    history.push({ role: "scammer", text: text ?? STAGES[stage].cannedLine[language] });
    history.push({ role: "parent", text: PARENT_REPLIES[language][stage - 1] });
    console.log(`   Parent: ${PARENT_REPLIES[language][stage - 1]}\n`);
    await sleep(PAUSE_MS);
  }

  history.pop(); // the nudge happens after silence, so drop the last parent reply
  await run("Nudge   ", 10, NUDGE_BEAT, true);

  // Classifier spot-check on this language's canned lines, whose tactics we know.
  let agree = 0;
  if (language !== "en") {
    console.log(`\nClassifier on ${language} canned lines (expected = planned tactic):`);
    for (let stage = 1; stage <= STAGE_COUNT; stage++) {
      const tag = await classifyTactic(STAGES[stage].cannedLine[language]);
      const got = "tactic" in tag ? tag.tactic : "FALLBACK";
      if (got === STAGES[stage].plannedTactic) agree++;
      console.log(`   stage ${String(stage).padStart(2)}: ${got.padEnd(9)} expected ${STAGES[stage].plannedTactic}`);
      await sleep(1500);
    }
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  console.log(`\nStages in character: ${passed}/${STAGE_COUNT}`);
  console.log(`Classifier valid:    ${validTactics}/${classified}`);
  if (language !== "en") console.log(`Classifier on canned lines: ${agree}/${STAGE_COUNT} matched the planned tactic`);
  console.log(`Placeholders used:   ${[...placeholdersSeen].join(" ") || "none"}`);
  console.log(`Scammer latency:     median ${median}ms, max ${sorted[sorted.length - 1] ?? 0}ms`);
  const ok = passed >= 8 && classified > 0 && validTactics === classified;
  console.log(ok ? "\nRESULT: PASS" : "\nRESULT: FAIL — adjust server/prompts.ts framing, or switch .env to the Gemini backup.");
  process.exit(ok ? 0 : 1);
}

main();
