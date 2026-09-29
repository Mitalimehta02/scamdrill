---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn (tight: 3–5 bullets on what changed and why, the 1–2 key files to read, how to try it, then commit; slice 1 also explains the system prompt design in detail)

## Slices

- [x] **1. Proof that Groq will play Inspector Sharma**
  Becomes usable: `npm run test:refusal` runs all 10 stages and one classifier call against the live Groq API and prints each line in character, with PASS or FALLBACK, the latency and the tokens. `npm test` proves the output check.
  Why now: This is the biggest unknown in the whole plan (refusal, latency, parameters, JSON mode). It's the one allowed "single layer" slice, because it proves a critical risk with runnable evidence. Project setup is included here.
  PRD ref: `prd.md > Resilience and Demo Mode`, `prd.md > Drill Script and Pacing`, `prd.md > Safety Guard`
  Spec ref: `spec.md > Stack`, `spec.md > Server: LLM Client`, `spec.md > Server: Prompts`, `spec.md > Drill Script`, `spec.md > Tactics, Explanations and Tips`, `spec.md > External Services and Dependencies`
  Build: Set up the project: `package.json` with the dev, build, test and test:refusal scripts; `tsconfig`; `vite.config.ts`; `.env.example`; an updated `.gitignore` (node_modules, dist); an MIT `LICENSE`. Write `src/drill/script.ts` (10 stages, planned tactics, canned lines, nudge line) and `src/drill/tactics.ts` (tactic list, points, fixed chip explanations, tips, `FAKE_PAYMENT`). Write `server/prompts.ts`, and `server/llm.ts` with `checkScammerOutput`, `generateScammerLine` and `classifyTactic` (`reasoning_effort` low, `include_reasoning` false, no `reasoning_format`, 8-second timeout, validation against the tactic list). Write `server/llm.test.ts` and `scripts/refusal-test.ts`.
  Verify (mechanical): `npm test` passes, including `checkScammerOutput("Transfer {AMOUNT} to {ACCOUNT} now.")` passing and a line with `₹2,50,000` / `004277813309` failing. `npm run test:refusal` with the learner's key: at least 8 of 10 stages PASS in character with no refusal markers, the classifier returns a valid tactic, and the latency is recorded. If it refuses: revise the framing and re-run, and then switch `.env` to Gemini.
  Learner check: Put your Groq key in `.env` (never in chat), turn on Zero Data Retention in the Groq console, run `npm run test:refusal`, and read Sharma's 10 lines. Do they sound like a real digital-arrest script, and are the placeholders used?
  Commit: `slice 1: groq refusal test + output check`

- [x] **2. A family can set up a drill and the parent can chat with a tagged, live scammer**
  Becomes usable: Setup (with Use demo details) → Handoff → Drill. Sharma's lines arrive from Groq with the real names filled in. Each bubble gets an amber chip that animates in, and the meter rises. Hang up and Call are always visible (for now they just end the drill with a simple placeholder screen). Demo mode, canned-line fallbacks and the offline note all work. The phone frame and training strip are styled.
  Why now: This is the kernel: a family-personalised rehearsal with tactics named live, using the two-step pipeline. Everything else hangs off it, and it's where your first reaction to the look and feel matters most.
  PRD ref: `prd.md > Family Setup`, `prd.md > Handoff`, `prd.md > The Drill Screen`, `prd.md > Tactic Tagging and Pressure Meter`, `prd.md > Resilience and Demo Mode`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Server: API Routes`, `spec.md > Placeholders`, `spec.md > API Client`, `spec.md > Drill Engine`, `spec.md > Screens`, `spec.md > Shared UI`, `spec.md > App Shell`, `spec.md > Look and Feel`, `spec.md > Data Model`
  Build: The Express routes (`/api/scammer`, `/api/classify`, `/api/health`) and the Vite proxy. `placeholders.ts`. `api.ts` (8-second and 3-second timeouts, fallbacks, demo typing delay). The reducer (stages, meter, AI failure count, offline mode). `App.tsx` with the screen switch. `tokens.css` and `app.css`. `PhoneFrame`, `TrainingStrip`, `PressureMeter`, `ChatBubble`, `TacticChip`, `TypingIndicator`, `ExitButtons`, `OfflineNote`. Setup, Handoff and Drill screens. Tests for `placeholders.test.ts`, `api.test.ts` (no setup value in any `/api/*` body) and the reducer's meter.
  Verify (mechanical): `npm test` passes (placeholders, leakage, meter only rises and is capped at 100). `npm run dev` starts both processes with no errors. `curl` against `/api/health` and `/api/scammer` returns JSON. `npm run build` type-checks cleanly. Load `/?demo=1` and confirm canned lines arrive with chips (checked in the browser).
  Learner check: Run `npm run dev`, open http://localhost:5173, tap Use demo details → Hand to Kamala → Start practice, and chat for 3–4 turns. Does it feel like a real chat under pressure, and is the look calm and serious rather than generic? Then try `/?demo=1`.
  Commit: `slice 2: setup, handoff and live tagged drill chat`

- [x] **3. The drill ends the right way: OTP, Pay, the safety guard, silence and partial**
  Becomes usable: At stage 5 the fake OTP banner slides in, and typing that code ends the drill. At stage 7 the Pay card appears, and tapping Pay ends it. Real-looking numbers are blocked before sending and end the drill. Waiting 25 seconds brings one nudge. Stage 10 ends as partial. Each ending reaches a basic ending screen with the correct label.
  Why now: Deterministic losing is the second half of the kernel, and the safety promise. It needs the working drill from slice 2.
  PRD ref: `prd.md > Fake OTP and Pay Card`, `prd.md > Endings (Deterministic)`, `prd.md > Safety Guard`, `prd.md > Drill Script and Pacing`
  Spec ref: `spec.md > Safety Guard`, `spec.md > Drill Engine`, `spec.md > Screens`, `spec.md > Shared UI`
  Build: `guard.ts` and `guard.test.ts` (every PRD example: born 1952, flat 1204, ₹5000, +91 phone number pass; 482913 after the OTP, "my PIN is 4521", Aadhaar, card and PAN block; the exact OTP → otp). The reducer handles `GUARD_LOSS`, `EXIT(pay)`, the nudge limit, OTP and Pay events, partial after 10, and `slipMessageIndex`, with `reducer.test.ts`. The `OtpBanner` and `PayCard` components, and the 25-second silence timer on the Drill screen.
  Verify (mechanical): `npm test` passes all the guard and reducer cases. `npm run build` is clean. In demo mode in the browser, all four endings are reached on purpose, each with the correct label.
  Learner check: In `/?demo=1`, play the drill four times: hang up early, type the OTP when it appears, tap Pay, and reply until stage 10. Also type "I was born in 1952" and "my flat is 1204" to confirm they don't end it. Does each ending feel right?
  Commit: `slice 3: otp, pay card, safety guard and deterministic endings`

- [x] **4. The parent's ending screen and the child's report card close the loop**
  Becomes usable: The full kind, teaching ending for each outcome (win facts, the highlighted slip message, the sensitive-data line, 1930 and cybercrime.gov.in). Then Hand back to [child] → a report card with the outcome, time, message count, tactics faced and not reached, the "Instant reflex" case, and a fixed tip. Run another drill keeps the setup details.
  Why now: This completes the journey a stranger must finish in under 3 minutes (the definition of done), and it's the screen the video's 30 seconds on the report card depends on.
  PRD ref: `prd.md > Parent Ending Screen`, `prd.md > Report Card (Child)`, `prd.md > The Core Journey`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Screens`, `spec.md > Tactics, Explanations and Tips`, `spec.md > Data Model`
  Build: `EndingScreen.tsx`, `ReportCard.tsx`, the tip-choice logic (slip tactic, or the highest-points tactic faced) with a unit test, Run another drill, and a README first pass (what, who, how to run, the AI pipeline).
  Verify (mechanical): `npm test` passes (tip choice, "Instant reflex" when the parent hangs up after 1 message). `npm run build` is clean. In the browser, a full demo run from setup to the report card completes with no console errors, and a live (non-demo) run also completes.
  Learner check: Do one full drill as a stranger would, from setup to the report card, and time it (the goal is under 3 minutes). Hang up at the first message once to see "Instant reflex". Does the report card tell a child what they'd want to know?
  Commit: `slice 4: parent ending screens and child report card`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 2 (the look and feel of the live drill can still shape slices 3–4)
- [x] Final kick-the-tires exploration and feedback completed (learner tried win, report card, OTP and Pay losses; five fixes requested and verified)

## Final Review

- [x] Report card headline uses neutral wording ("Instant reflex: ended the call after 1 message"), because it said "hung up" after Call [contact]
- [x] Win fact reads "'Digital arrest' doesn't exist in Indian law."
- [x] Confirm Hang up / Call stay active while the scammer is typing
- [x] Centred system note at the top of the chat: "Incoming call · CBI Cyber Cell, Delhi"
- [x] README: screenshots at the top, "Built with the Devpost Learn skill pack" (links to scope/prd/spec), and an "AI tools used" disclosure (Claude Code, Groq gpt-oss)
- [x] Learner retests OTP and Pay loss screens (reported tested; no changes requested, and no specific observations were given)
- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [not started]
Route and stops: [not started]
Edit outcome: [not started]
Reflection: [not started]
Activity mode: [not started]

## Revisions
- Scammer prompt now says "deliver ONLY this beat; never ask for a code or money unless the beat asks" and "your grandchild {GRANDCHILD}". In the first live run, stage 3 jumped ahead to demanding {AMOUNT}, and the model wrote "your {GRANDCHILD}".
- The classifier prompt has a priority rule (money → PAYMENT, code → OTP). The first live run labelled the stage 7 transfer demand as AUTHORITY.
- The JSON-mode fallback is per call (retry once with prompt-only JSON on a 400), not switched off globally. Groq returned a single 400 in JSON mode mid-run, which previously disabled it for the rest of the session.
- The output check also rejects unknown placeholders. The live run produced `{GRUNDCHILD}`, which would have silently dropped the grandchild's name.
- Nudges use the fixed ISOLATION tag and skip the classifier. The PRD says a nudge is tagged ISOLATION, but the classifier labelled one URGENCY.
- Parent replies are converted to placeholders in the browser (`toPlaceholders`) before being stored or sent, and a `{CHILD}` placeholder was added. The plan only covered names in scammer text, but a parent naturally types "Can I call Rahul?", which would have sent a real name to the AI.
- The relation field ("son") isn't replaced or included in the leakage test. It's a generic word, not identifying data, and replacing "son" everywhere would garble normal replies.
- The partial ending after stage 10 was moved from slice 3 into the slice 2 reducer. Without it, a reply at stage 10 would request a non-existent stage 11 and crash; slice 3 still adds the rest of the endings.
- React StrictMode is left off. In development it runs effects twice, which doubles every Groq call against the 8,000 tokens/minute free tier.
- Live-mode scammer lines wait at least 900 ms. Groq often answers in about 0.5 s, which made the typing indicator flicker.
- Early-checkpoint tweaks added to slice 2 at the learner's request: the meter shifts colour (slate → amber → red), "typing…" in the header, bubble timestamps, a chip slide-in with a brief amber glow on its bubble, and an "● On call mm:ss" header timer. The PRD's "red only for Hang up" was relaxed for the meter's top band.
- The OTP banner drops in below the drill header, over the top of the chat, and is fully opaque. At the top of the screen, it hid the timer and pressure meter at exactly the moment they spike, which is the key video shot.
- The Pay card is stored as a special chat item (`kind: "pay"`) that is excluded from the AI history and from tagging, and the loss screen's "moment" uses the scammer's last actual line. The spec didn't say how the card lives in the chat.
- The silence timer restarts while the parent is typing, so a slow typist isn't interrupted mid-reply. The PRD only said "25 seconds with no reply".
- Early-checkpoint feedback (learner tried the drill and reviewed screenshots): it reads as calm and serious, not generic. Fixes applied: a compact header (name on one line, smaller badge and timer, a one-row meter), 56px exit buttons, timestamps tucked into the bubble's last line, scrolling that keeps a new message's top in view, and hidden scrollbars inside the phone. The "coming soon" language options were confirmed.
- A deterministic rule labels any scammer line containing `{AMOUNT}` or `{ACCOUNT}` as PAYMENT before the classifier is asked. In a live run, gpt-oss-20b labelled a stage 8 line demanding {AMOUNT}, which also threatened the grandchild, as FEAR, despite the prompt's priority rule.
- The report card's second stat reads "scammer messages" (not "…before the exit"), because the longer label wrapped onto three lines in the phone frame.
