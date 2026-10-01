---
doc: spec
status: approved
---

# ScamDrill — Technical Spec

## How This Works, In Plain Language
ScamDrill has two parts.

**The app in the browser (React)** does almost everything:
- It shows the five screens.
- It holds the family's details in memory.
- It runs the 10-stage drill script, the pressure meter, the fake OTP banner and the Pay card.
- It checks every reply against the safety guard and decides how the drill ends.

The browser is the referee: every rule is plain code you can read and test.

**A small server (Node + Express)** exists for one reason: the Groq API key must stay secret, and anything in the browser can be read by anyone. The server has two doors:
- **`/api/scammer`**: "here's the stage and the recent chat; write Inspector Sharma's next line." It asks `gpt-oss-120b`.
- **`/api/classify`**: "here's the line Sharma just said; which tactic is it?" It asks `gpt-oss-20b` and gets back a single tactic name.

This is the **two-step AI pipeline**. One model acts, and a second, smaller model labels. They're separate so each prompt stays simple, and so a labelling failure can't break the dialogue.

**Real names never leave the browser.** The browser sends placeholders like `{PARENT}` and `{BANK}`, and swaps in the real names ("Kamala ji", "SBI") only when it shows the message on screen. The scammer also never writes numbers itself. The amount and account number are `{AMOUNT}` and `{ACCOUNT}` placeholders, filled from the same fixed fake values shown on the Pay card.

**Every AI step has a written-in-advance fallback.** If the scammer call is slow (over 8 seconds), fails or refuses, the stage's canned line is used. If the classifier fails, the stage's planned tactic is used. So the drill always works, and `?demo=1` runs it entirely on canned lines with no server at all.

Why this shape: one screen app plus one tiny server is the smallest design that keeps the key secret. There's no database because nothing is stored (`prd.md > Non-Goals`), and no accounts because the device is passed from hand to hand.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Setup:** the child types the details or taps Use demo details. These are stored **only in React memory** (`FamilySetup`). Tapping Hand to [Parent] moves to the Handoff screen.
2. **Handoff:** Start practice creates a new drill:
   - a random 6-digit OTP
   - `stage = 1`
   - `pressure = 0`
   - the start time

   The browser immediately asks for stage 1's line.
3. **Getting a scammer line** (`src/drill/api.ts`):
   1. The browser `POST`s `{stage, history}` to `/api/scammer`. The history is trimmed to the last 6 messages and uses placeholders.
   2. The server adds the system prompt, calls Groq and checks the reply:
      - it isn't empty
      - it doesn't look like a refusal
      - it has no digit strings of 6 or more and no links
      - it's no longer than about 60 words
   3. The server returns `{text}` or `{fallback: true}`.
   4. After 8 seconds, or on any failure, the browser uses `CANNED_LINES[stage]`.
   5. The browser fills in the real names and shows the bubble.
4. **Tagging, without making the chat wait:** the bubble is shown **as soon as the line arrives**. Then the browser `POST`s the placeholder text to `/api/classify`, and the server returns `{tactic}`. The chip **animates in** under the bubble when the answer comes back, with its **fixed** one-line explanation, and the meter adds that tactic's points. The stage's planned tactic is used instead if:
   - the answer isn't one of the 7 allowed tactics
   - the call fails
   - it takes more than **3 seconds**
5. **The parent replies:** the text first goes through `guard.ts` in the browser.
   - If it matches the fake OTP or a blocking rule, the drill ends with a loss. The text is **never sent**.
   - Otherwise it's added to the history, `stage` goes up by 1, and step 3 repeats.
   - Stage 5 starts by sliding in the OTP banner. Stage 7 starts by adding the Pay card.
   - After stage 10, the drill ends as partial.
6. **Silence:** a 25-second timer per stage asks for one nudge, which is tagged ISOLATION and doesn't advance the stage.
7. **Exits:** Hang up, Call or Pay immediately set the ending. The **Ending** screen reads the ending from the drill state, and **Report card** calculates its figures from the same state.
8. **Run another drill** clears the drill state but keeps `FamilySetup`. Refreshing the page clears everything.

## Stack
| Piece | Choice | Why (learner-agreed) | Docs |
|---|---|---|---|
| Frontend | **Vite + React + TypeScript** | Typed stages, tactics and endings prevent stage-logic bugs | https://vite.dev/guide/ · https://react.dev |
| Styling | **Plain CSS + CSS variables** | Our own tokens, no generic AI-app look, no extra dependency | https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties |
| Server | **Node + Express** (TypeScript, run with `tsx`) | The smallest way to keep the key secret | https://expressjs.com · https://tsx.is |
| AI SDK | **`openai`** Node SDK with a custom `baseURL` | Groq and Gemini both accept the OpenAI format, so switching provider only means changing `.env` | https://github.com/openai/openai-node |
| AI provider | **Groq**: `openai/gpt-oss-120b` (scammer), `openai/gpt-oss-20b` (classifier), reasoning effort low | Fast. Each model has its own free-tier limit. No training on data by default. | https://console.groq.com/docs/openai · https://console.groq.com/docs/rate-limits |
| Tests | **Vitest** | Unit tests for the guard, reducer and placeholders (the PRD criteria) | https://vitest.dev |
| Dev runner | **concurrently** | One `npm run dev` starts Vite and the server | https://www.npmjs.com/package/concurrently |
| Font | **Noto Sans** + **Noto Sans Devanagari** (Google Fonts, 400/600/700) | Elderly-friendly. Devanagari renders Hindi cleanly (slice 5) | https://fonts.google.com/noto/specimen/Noto+Sans |

Runtime dependencies: `react`, `react-dom`, `express`, `openai`, `dotenv`. Dev dependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `tsx`, `vitest`, `concurrently`, `@types/*`.

**Groq parameters** (learner-verified at https://console.groq.com/docs/reasoning):
- Both models get `reasoning_effort: "low"` and `include_reasoning: false`.
- **Do not send `reasoning_format`.** It isn't supported for gpt-oss and conflicts with `include_reasoning`.

**To verify early in the build:** the model IDs are still listed, and whether `response_format: {type: "json_object"}` is accepted on `gpt-oss-20b`. If it isn't, ask for JSON in the prompt only. The answer is validated against the tactic list either way.

## Where It Runs and How Someone Tries It
- **Runtime:** Node 20 or later on the learner's Windows laptop, in a browser at `http://localhost:5173`. Vite proxies `/api/*` to Express on port `3001`.
- **Setup:**
  1. `npm install`.
  2. Copy `.env.example` to `.env` and fill in `AI_API_KEY`.
  3. In the Groq console, go to **Data Controls → Zero Data Retention** and turn it **on** (learner decision).
- **Start:** `npm run dev`, then open `http://localhost:5173`.
- **Demo mode:** open `http://localhost:5173/?demo=1`. This uses canned lines and no API calls. It's the safety net for recording.
- **Refusal test:** `npm run test:refusal` runs all 10 stages and a classifier call against the live API and prints the results.
- **Unit tests:** `npm test`.
- **Recording:** use a laptop browser window. The app is shown in a centred phone frame (`prd.md > Look and Feel`).
- **Submission:** a public GitHub repo with an MIT `LICENSE`, plus the YouTube video. Deployment is **not required**.
- **Static demo deployment (slice 5).** `npm run build:demo` sets `VITE_DEMO_ONLY=true` and a relative base path (`--base=./`), so demo mode is forced, no `/api` call is ever made, and `dist/` works from any static host or sub-path. The build shows a "Demo mode: scripted lines" note under the training strip.
  - **Vercel:** import the GitHub repo, set the build command to `npm run build:demo` and the output directory to `dist`, and deploy. No environment variables are needed.
  - The live-AI version stays local. The key and the free-tier limit are never exposed.

## Look and Feel
Implements `prd.md > Look and Feel`. The CSS variables go in `src/styles/tokens.css`:

| Token | Value | Use |
|---|---|---|
| `--navy` | `#1B2A41` | header, primary buttons, parent bubbles |
| `--slate` | `#3C4A5E` | secondary text on dark |
| `--bg` | `#F6F4EF` (off-white) | app background |
| `--surface` | `#FFFFFF` | cards, scammer bubbles |
| `--ink` | `#16202E` | body text (contrast ≥ 7:1 on `--bg`) |
| `--amber` | `#B86E00`; `--amber-soft` `#FFF3DC` | training strip, tactic chips, meter fill |
| `--green` | `#1F7A4D` | Call button, win states only |
| `--red` | `#B3261E` | Hang up button; the meter uses slate `#8FA3BF` (<35) → amber `#F0A93A` (35–69) → red `#EF5A45` (≥70). Never for failure screens. |

- **Type:** Noto Sans, with Noto Sans Devanagari next in the font stack, so Hindi renders cleanly. `<html lang>` follows the chosen language. Base `18px`, chat text `18px`, headings 24–28px, nothing under 15px. Line height 1.5.
- **Sizes:** tap targets at least 56px high. Hang up and Call are full-width halves, 56px high. The drill header is compact (the caller name on one line at 17px, a one-row meter) so at least two bubbles with chips fit on screen. Scrollbars are hidden inside the phone frame.
- **Phone frame:** on screens wider than 480px, the app sits in a centred 390×844 rounded frame on a dark slate backdrop. On phones it's full-screen.
- **Chat:** scammer bubbles on the left (white, with a thin border), parent bubbles on the right (navy, white text), a three-dot typing indicator, and a generic badge avatar (an inline SVG, not a real emblem).
- **Motion:** the OTP banner slides down (300ms), the meter fill animates its width and colour, chips slide and fade in (300ms), and the flagged bubble glows amber once (1.6s). No shaking or flashing.
- **Header extras:** "typing…" replaces "CBI Cyber Cell" while waiting. `CallTimer` shows "● On call mm:ss" from `startedAt`. Bubbles show `formatClock(at)` timestamps (15px).
- **Copy tone:** calm and kind. No "failed", "fraud" or "stupid". Endings follow the PRD wording exactly.
- **Branding:** our own "ScamDrill" wordmark. No WhatsApp logos or colours, and no real government emblems.

## Components

### Server: API Routes (`server/index.ts`)
- `POST /api/scammer` with `{stage: 1–10, history: {role: "scammer"|"parent", text}[], nudge?: boolean, language?: "en"|"hi"|"hinglish"}` → `{text} | {fallback: true}`
- `POST /api/classify` with `{text}` → `{tactic} | {fallback: true}`
- `GET /api/health` → `{ok: true, provider}`
- It never logs request bodies. It rejects a body over 4 KB. It never returns an error status to the browser for AI failures; it returns `{fallback: true}` instead.
- PRD ref: `prd.md > Resilience and Demo Mode`, `prd.md > Drill Script and Pacing`.

### Server: LLM Client (`server/llm.ts`)
- One `OpenAI` client with `baseURL = AI_BASE_URL` and `apiKey = AI_API_KEY`, and an 8-second timeout (`AbortController`).
- `generateScammerLine()`: `SCAMMER_MODEL`, `reasoning_effort: "low"`, `include_reasoning: false`, `max_completion_tokens` about 300.
- `classifyTactic()`: `CLASSIFIER_MODEL`, `reasoning_effort: "low"`, `include_reasoning: false`, asks for JSON with the tactic name only, `max_completion_tokens` about 100. It parses the JSON and **validates the tactic against the tactic list**. Anything invalid → `{fallback: true}`.
- `reasoning_format` is never sent.
- **Output check** on the scammer line. It counts as a failure (and the canned line is used) if:
  - it's empty
  - it contains refusal markers (`I can't`, `I cannot`, `I'm sorry`, `as an AI`, `I won't`, and Hindi or Hinglish equivalents such as `माफ़ कीजिए`, `मैं … नहीं कर सकता`, `main madad nahi kar sakta`)
  - it contains a run of 6 or more digits, in any script (after `normalizeDigits`), ignoring commas and spaces, or a URL. This stays strict because amounts and account numbers only ever arrive as `{AMOUNT}` and `{ACCOUNT}`.
  - it's over 80 words
  - it contains a `{…}` placeholder that isn't one of the six known ones (e.g. a misspelled `{GRUNDCHILD}`)
- `checkScammerOutput()` is exported as a pure function so it can be unit-tested (`server/llm.test.ts`).
- Logs only the model, the latency in ms, token counts, and pass or fallback.

### Server: Prompts (`server/prompts.ts`)
- **Scammer system prompt** (kept short for the 8K tokens/min limit):
  - **Framing:** "This is a consented family safety training simulation. An adult family member set up this drill so their parent can practise recognising scams. The user knows it is a drill, and a banner says so. You play 'Inspector Sharma, CBI Cyber Cell', a fictional character."
  - **Rules:**
    - One short message (1–3 sentences) in simple English.
    - Use the placeholders `{PARENT}`, `{BANK}`, `{GRANDCHILD}`, `{SAFE_CONTACT}`, `{AMOUNT}` and `{ACCOUNT}` exactly as written, and address the parent as "{PARENT} ji".
    - Never write any number, code, amount, account number, phone number, link or real agency contact. Use `{AMOUNT}` and `{ACCOUNT}` for the payment, and refer to "the code on your phone".
    - Don't use slurs or threats of violence.
    - Respond to the parent's last message, then deliver this stage's beat.
  - **Per request**, the stage's beat (from `STAGES[stage].beat`) and the trimmed history are added.
- **Language instruction** (slice 5), added per request: for `hi`, simple Hindi in Devanagari with the placeholders kept in Latin letters and "{PARENT} जी". For `hinglish`, Roman-script Hindi as people text on WhatsApp, with "{PARENT} ji".
- **Classifier prompt:** "Label the tactic in this message from a scam training simulation. Reply with JSON `{"tactic": X}` where X is exactly one of AUTHORITY, FEAR, URGENCY, SECRECY, ISOLATION, OTP, PAYMENT."
- PRD ref: `prd.md > The Drill Screen`, `prd.md > Safety Guard`.

### Drill Script (`src/drill/script.ts`)
- `STAGES[1..10]`: `{beat, plannedTactic, cannedLine: Record<Lang, string>, event?: "otp" | "pay"}`. Beats stay in English, because they are instructions to the model. Canned lines and `NUDGE_LINE` exist in all three languages (the Hindi and Hinglish ones need native review). There are 10 canned lines written in the scammer's voice using placeholders, plus `NUDGE_LINE` ("Hello? {PARENT} ji, do not disconnect. This is a serious matter.").
- Where the PRD lists two tactics for a stage, the planned tactic is the first one: stage 2 → AUTHORITY, 4 → SECRECY, 6 → FEAR. Stages 8–10 → URGENCY, ISOLATION, PAYMENT.
- PRD ref: `prd.md > Drill Script and Pacing`, `prd.md > Resilience and Demo Mode`.

### Tactics, Explanations and Tips (`src/drill/tactics.ts`)
- `TACTICS`: the 7 names, each with its **points**, **fixed one-line chip explanation** and **fixed tip**.
- **Final meter points:** AUTHORITY 10 · FEAR 10 · URGENCY 15 · SECRECY 15 · ISOLATION 15 · OTP 20 · PAYMENT 25. The total is capped at 100. Following the planned tactics, the meter reaches 100 when the Pay card appears at stage 7.
- `FAKE_PAYMENT = {amount: "₹2,50,000", account: "RBI-SAFE-0042-7781-3309"}` is the fictional data used by the Pay card **and** by the `{AMOUNT}`/`{ACCOUNT}` placeholders, so the chat and the card always match.
- `ENDING_TIPS` has one fixed tip per ending, and `WIN_FACTS` holds the three facts plus the 1930 / cybercrime.gov.in text.
- PRD ref: `prd.md > Tactic Tagging and Pressure Meter`, `prd.md > Report Card (Child)`, `prd.md > Parent Ending Screen`.

### Drill Engine (`src/drill/reducer.ts`)
- A typed `useReducer` state machine.
- **Actions:** `START`, `SCAMMER_LINE(text, tactic)`, `PARENT_REPLY(text)`, `NUDGE`, `EXIT(hangup|call|pay)`, `GUARD_LOSS(kind)`, `AI_FAILED`, `AI_OK`.
- **Rules it enforces:**
  - Each reply advances one stage.
  - There is at most one nudge per stage.
  - The meter only rises.
  - Stage 5 sets `otpVisible`, and stage 7 appends the Pay card.
  - After stage 10, the ending is `partial`.
  - After 3 consecutive `AI_FAILED`, `offlineMode = true`.
  - `slipMessageIndex` = the last scammer message before a loss.
- It contains no network code, so it's fully unit-testable.
- PRD ref: `prd.md > Drill Script and Pacing`, `prd.md > Endings (Deterministic)`.

### Safety Guard (`src/drill/guard.ts`)
- `checkReply(text, {fakeOtp, stage}) → "otp" | "sensitive" | "ok"`. It's a pure function, and the checks run **in this order**:
  1. **Exact fake OTP** (digits only, ignoring spaces) → `"otp"`.
  2. **Remove phone numbers** (`+91` followed by 10 digits, or a 10-digit number starting with 6–9, spaces or dashes allowed) from a working copy. They are never blocked. This has to happen first, because "+91 98765 43210" has 12 digits, the same as an Aadhaar number.
  3. **Always sensitive:**
     - Aadhaar: 12 digits in a 4-4-4 or continuous pattern
     - a card: 13–19 digits, spaces or dashes allowed
     - a PAN: `/\b[A-Z]{5}\d{4}[A-Z]\b/i`
     - a code word (`pin|cvv|otp|code|password`) within about 3 words of a digit string
  4. **A 4–6 digit number** that isn't next to ₹, Rs or rupees and isn't a 1900–2099 year next to born, year or since. It's `"sensitive"` if `stage ≥ 5` and the reply is mostly that number (at most 2 other words), **or** it's next to a code word.
  5. Otherwise → `"ok"`.
- PRD ref: `prd.md > Safety Guard`.

### Placeholders (`src/drill/placeholders.ts`)
- `fill(text, setup)` swaps `{PARENT}`, `{BANK}`, `{GRANDCHILD}` and `{SAFE_CONTACT}` for the real values, and `{AMOUNT}` and `{ACCOUNT}` for the `FAKE_PAYMENT` values, when displaying. If a placeholder is missing from the text, nothing happens. Any leftover unknown `{…}` is removed.
- `toPlaceholders(text, setup)` converts what the parent types (e.g. "Can I call Rahul?" → "Can I call {SAFE_CONTACT}?") before it is stored or sent. It is case-insensitive and matches whole words only. Includes `{CHILD}` for the child's name.
- Real values are **never** passed to `api.ts`.
- Canned lines use the same placeholders.
- PRD ref: `prd.md > Safety Guard` (privacy).

### API Client (`src/drill/api.ts`)
- `getScammerLine(stage, history, {nudge})` uses an **8-second** timeout. `classify(text)` uses a **3-second** timeout.
  - Each returns the canned line or planned tactic when anything fails or comes back as `{fallback: true}`.
  - Each reports AI success or failure to the reducer.
- **Nudges are not classified:** they always use the fixed `NUDGE_TACTIC` (ISOLATION), as the PRD specifies.
- The typing indicator shows while waiting for the scammer line. The classifier never delays the bubble.
- In **demo mode** (`?demo=1` or `VITE_DEMO_ONLY`), it never calls `fetch`. It returns canned lines after a **simulated typing delay of about 1–2 seconds, based on the line's length** (about 1000ms + 15ms per character, capped at 2000ms), so recordings feel like live mode. The planned tactic's chip animates in about 400ms later, as it does live.
- **Automated leakage test** (`src/drill/api.test.ts`): it stubs `fetch`, runs a drill with the demo setup values, and asserts that **no setup value** (child, parent, bank, grandchild, safe contact, relation) appears in any `/api/*` request body.
- PRD ref: `prd.md > Resilience and Demo Mode`.

### Screens (`src/screens/`)
- **`SetupScreen.tsx`:** implements `prd.md > Family Setup`.
  - Controlled inputs: child name, parent name, bank (placeholder "e.g. SBI, HDFC"), grandchild name, safe contact name, optional relation, and language (English; Hindi and Hinglish disabled, "coming soon").
  - Use demo details fills: Anjali / Kamala / SBI / Aarav / Rahul / son.
  - Hand to [Parent] is disabled until the required fields are filled.
  - The note about first names and storing nothing.
- **`HandoffScreen.tsx`:** implements `prd.md > Handoff`.
- **`DrillScreen.tsx`:** implements `prd.md > The Drill Screen`, `prd.md > Fake OTP and Pay Card`. It owns the 25-second silence timer and the flow from reply → guard → API → reducer.
- **`EndingScreen.tsx`:** implements `prd.md > Parent Ending Screen`. It shows the highlighted slip message, the three win facts, the sensitive-data line and the 1930 steps.
- **`ReportCard.tsx`:** implements `prd.md > Report Card (Child)`.
  - It shows the tactics faced and not reached, the time and the message count.
  - "Instant reflex" when the parent hung up after 1 message.
  - **Choosing the tip:** after a loss, the tip for the slip message's tactic. Otherwise the tip for the tactic with the highest points that they faced.

### Quick Replies and Reply Limit (`src/components/QuickReplies.tsx`)
Added after the judge review.
- `STRINGS[lang].drill.quickReplies(contactName)` gives 2 replies, in one row. `DrillScreen.sendText(text)` is the single path used for both typed and tapped replies: `checkReply` → `toPlaceholders` → `PARENT_REPLY`.
- The reply input has `maxLength={MAX_REPLY_CHARS}` (300) and shows a counter from 240 characters. The server's per-message limit is 600, so a maximum-length reply never makes the history invalid.
- PRD ref: `prd.md > The Drill Screen`.

### Read-Aloud (`src/drill/speech.ts`, optional)
- `pickVoice(lang)` uses `speechSynthesis.getVoices()` and uses `hi-IN` for Hindi and `en-IN` for English and Hinglish (Roman script). It returns null when there's no match, and the header toggle is then hidden.
- When the toggle is on (it's off by default), each new scammer line is spoken in its filled-in form. Nothing is sent anywhere; it's the browser's own voice.
- PRD ref: `prd.md > The Drill Screen`.

### Shared UI (`src/components/`)
These are used across screens and cover `prd.md > Screens and Layout` and `prd.md > The Drill Screen`:
- `PhoneFrame`
- `TrainingStrip`: always rendered by `App.tsx` above every screen
- `PressureMeter`
- `ChatBubble`
- `TacticChip`
- `TypingIndicator`
- `OtpBanner`
- `PayCard`
- `ExitButtons`
- `OfflineNote`

### Strings Dictionary (`src/i18n/strings.ts`)
Added in slice 5. There's no i18n library.
- `STRINGS: Record<Lang, Strings>`, where `Lang = "en" | "hi" | "hinglish"`. It holds every visible string: Setup, Handoff, the drill chrome, the OTP SMS, the Pay card, tactic names, chip explanations, tips, the win facts, the 1930 / cybercrime.gov.in card, ending text and the report card.
- `LangContext` + `useT()` (`src/i18n/useT.ts`) gives each screen the strings for the current language.
- `tactics.ts` keeps only the language-free data (tactic IDs, points, `FAKE_PAYMENT`).
- A unit test checks that every language has every key, and that the safety facts and helpline appear in each.
- PRD ref: `prd.md > Languages`.

### Digit Normaliser (`src/drill/digits.ts`)
Added in slice 5.
- `normalizeDigits(text)` maps Devanagari (०–९) and the other Indian-script, Arabic-Indic and full-width decimal digits to ASCII 0–9.
- It is called first in `checkReply` (browser) and in `checkScammerOutput` (server), so no script can smuggle a number past either check.
- PRD ref: `prd.md > Safety Guard`.

### App Shell (`src/App.tsx`)
- A single `screen` state (`setup | handoff | drill | ending | report`). There is no router.
- It holds `FamilySetup`, and the drill reducer's state and dispatch.
- It reads `?demo=1` once.
- PRD ref: `prd.md > The Core Journey`.

## Data Model
All data is held in memory in the browser (React state). Nothing is written to disk, localStorage or the server.

```ts
type Tactic = "AUTHORITY"|"FEAR"|"URGENCY"|"SECRECY"|"ISOLATION"|"OTP"|"PAYMENT";
type FamilySetup = { childName; parentName; bank; grandchildName; safeContactName; safeContactRelation?; language: "en" };
type Msg = { role: "scammer"|"parent"; text: string /* placeholder form */; tactic?: Tactic; nudge?: boolean; kind?: "pay" };
type Ending = { type: "win"|"loss"|"partial"; reason: "hangup"|"call"|"otp"|"sensitive"|"pay"|"stayed" };
type DrillState = { stage; messages: Msg[]; pressure; fakeOtp; otpVisible; nudgedThisStage;
                    consecutiveAiFailures; offlineMode; startedAt; endedAt?; ending?; slipMessageIndex? };
```

| Data | Lives in | Updated by | When you leave and come back |
|---|---|---|---|
| FamilySetup | `App` state | Setup form | Kept for "Run another drill"; **cleared on refresh** |
| DrillState | `App` reducer | drill actions | Reset on Start and on refresh |
| API key | server `.env` | the learner | Never sent to the browser |
| Messages sent to the AI | request bodies | `api.ts` | Placeholder form only; not stored by the server (Groq ZDR on) |

## File Structure
```
nvidia/                      # repo root (project folder)
├── package.json             # scripts: dev, build, build:demo, test, test:refusal
├── vite.config.ts           # React plugin, /api proxy → :3001
├── tsconfig.json
├── index.html               # loads Noto Sans, mounts #root
├── .env.example             # AI_API_KEY, AI_BASE_URL, SCAMMER_MODEL, CLASSIFIER_MODEL, PORT
├── .gitignore               # .env, .env.*, !.env.example, /devpost/learner-profile.md, node_modules, dist
├── LICENSE                  # MIT
├── README.md                # what / who / how to run / how the AI pipeline works
├── server/
│   ├── index.ts             # Express: /api/scammer, /api/classify, /api/health
│   ├── llm.ts               # OpenAI-SDK client (Groq/Gemini via baseURL), timeout, output check
│   ├── prompts.ts           # scammer + classifier prompts (training-simulation framing)
│   └── llm.test.ts          # output-check tests (6+ digits, URLs, refusals)
├── scripts/
│   └── refusal-test.ts      # runs all 10 stages + a classifier call live; prints pass/fallback
├── src/
│   ├── main.tsx
│   ├── App.tsx              # screen switch, holds setup + drill reducer, reads ?demo=1
│   ├── styles/
│   │   ├── tokens.css       # colour/type/size variables
│   │   └── app.css
│   ├── drill/               # pure logic — no React, fully unit-tested
│   │   ├── script.ts        # 10 stages: beat, planned tactic, canned line, event
│   │   ├── tactics.ts       # points, chip explanations, tips, ending copy
│   │   ├── reducer.ts       # the drill state machine
│   │   ├── guard.ts         # safety guard
│   │   ├── placeholders.ts  # {PARENT}… ⇄ real names, browser-side only
│   │   ├── api.ts           # fetch with timeout + fallback; demo mode
│   │   └── *.test.ts        # guard, reducer, placeholders, api (leakage) tests
│   ├── screens/             # SetupScreen, HandoffScreen, DrillScreen, EndingScreen, ReportCard
│   └── components/          # PhoneFrame, TrainingStrip, PressureMeter, ChatBubble, TacticChip,
│                            # TypingIndicator, OtpBanner, PayCard, ExitButtons, OfflineNote
└── devpost/                 # planning docs (scope, prd, spec + HTML companions)
```

## External Services and Dependencies

### Groq Chat Completions (primary)
- `POST https://api.groq.com/openai/v1/chat/completions`, sent through the `openai` SDK (`baseURL: https://api.groq.com/openai/v1`).
- **Auth:** `Authorization: Bearer $AI_API_KEY`.
- **Scammer payload:** `{model: "openai/gpt-oss-120b", messages: [system, …trimmed history, user: stage beat], reasoning_effort: "low", include_reasoning: false, max_completion_tokens: 300}`. The line is read from `choices[0].message.content`.
- **Classifier payload:** `{model: "openai/gpt-oss-20b", messages: [system, user: text], response_format: {type: "json_object"}, reasoning_effort: "low", include_reasoning: false, max_completion_tokens: 100}`. It returns `{"tactic": "URGENCY"}`, which is validated against the tactic list. **Never send `reasoning_format`.**
- **Free-tier limits** (checked on 2026-09-28, https://console.groq.com/docs/rate-limits): 30 requests/min, 1,000 requests/day, 8,000 tokens/min and 200,000 tokens/day, **for each model**. A drill makes about 20–22 calls, so there's room for about 45 drills a day per model. Keep the system prompt under about 400 tokens and the history to 6 messages.
- **Data:** by default, Groq doesn't keep inference data beyond up to 30 days of troubleshooting logs (learner-verified). **Zero Data Retention will be turned on** in Data Controls.
- **Cost:** free tier.

### Gemini (backup, `.env` switch only)
- `AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/`, with Gemini model IDs in `SCAMMER_MODEL` and `CLASSIFIER_MODEL` (https://ai.google.dev/gemini-api/docs/openai).
- **Warning:** on the free tier, Google may use inputs to improve products, and human reviewers may read them (https://ai.google.dev/gemini-api/terms). Placeholders keep real names out, but this is still the backup only.

### Google Fonts
- Noto Sans via a `<link>` tag. If it's offline, the system sans-serif font is used.

## Important Failure Modes
- **The scammer call is slow, fails or refuses** → the canned line for the stage. After 3 failures in a row, the note "Running in offline practice mode". The parent never sees an error.
- **The classifier returns junk, isn't a valid tactic, or takes more than 3 seconds** → the planned tactic for the stage. The chip and meter still work.
- **Rate limit (429) during recording** → treated as a failure, so canned lines are used. Record in `?demo=1` if the limits are close.
- **The provider refuses the role entirely** (found by `npm run test:refusal`) → adjust `prompts.ts` framing. If it still refuses, switch `.env` to Gemini.
- **The scammer invents numbers or links** → the output check replaces the line with the canned one. Real amounts and account numbers only come from `{AMOUNT}` and `{ACCOUNT}`, so a strict check never rejects a valid payment line.

## What Was Simplified and Why
- **Placeholders instead of sending real names:** privacy by design. The fuller version, with names in prompts, would read slightly more naturally but would send family data to a third party.
- **Fixed chip explanations and tips instead of AI-written ones:** always accurate, and this matches `prd.md > Product Decisions`. The AI only picks the tactic *name*.
- **One tactic per scammer message:** simpler chips and meter maths. The fuller version would support multiple tags per message.
- **React memory instead of storage:** "store nothing". Drill history would need localStorage or a database (deferred).
- **No router:** five screens held in one state variable.
- **Local only:** the video is what judges see. A static demo-mode deployment is a stretch goal.

## Decisions and Open Issues

**Learner decisions:**
- **Groq**, with `gpt-oss-120b` as the scammer and `gpt-oss-20b` as the classifier, low reasoning effort, short prompts and trimmed history. Gemini is the `.env` backup.
- **Groq Zero Data Retention** is turned on as a setup step.
- **Placeholders**, so real names never go to the AI.
- **Vite + React + TypeScript** for the frontend, and **Express** for the server, all started with one `npm run dev`.
- **Plain CSS** with variables, and minimal dependencies.
- **Local only for the proof of concept.** Deploying demo mode as a static site is the stretch goal.

- **Changes at review:**
  - `{AMOUNT}` and `{ACCOUNT}` placeholders, so the digit check can stay strict.
  - Both models get `reasoning_effort: "low"` and `include_reasoning: false`, and never `reasoning_format`.
  - The classifier's answer is validated against the tactic list, with the planned tactic as the fallback.
  - The bubble appears immediately and the chip animates in (planned tactic after 3 seconds).
  - A typing delay based on line length in demo mode.
  - Automated leakage and output-check tests.

**Details I derived from those decisions (accepted by learner):**
- Vitest for unit tests.
- `concurrently` to start Vite and the server together.
- The final meter points shown above (your proposed values, with ISOLATION and SECRECY both 15).
- The planned tactic is the first one listed for mixed stages.
- The fixed chip explanations.
- The output check on scammer lines (no invented numbers or links).
- The demo names: Anjali, Kamala, SBI, Aarav, Rahul (son).

**Learner uncertainty addressed:** "How do I design prompts so the provider doesn't refuse a scammer role in a labelled training simulation?"
- **What should help:**
  - State the consent and the training purpose in the system prompt.
  - Frame it as a fictional character.
  - Ask for short, single-message lines driven by beats rather than "run a scam".
  - Ban real numbers and links, so nothing it writes would be usable in a real scam.
  - Keep the classifier's framing clinical ("label the tactic").
- **How we'll check:** `npm run test:refusal` at the start of `5-build`. **Evidence needed:** all 10 stages return an in-character line with no refusal markers, and the classifier returns valid JSON with an allowed tactic. If not, change the framing, re-run, and then fall back to Gemini.

**Acceptance criteria added here:**
- No real setup value ever appears in any request body to `/api/*`. **Automated** in `src/drill/api.test.ts`, and also visible in the browser's Network tab.
- `checkScammerOutput("Transfer {AMOUNT} to {ACCOUNT} now.")` passes. `checkScammerOutput("Transfer ₹2,50,000 to 004277813309")` fails, so the canned line is used (`server/llm.test.ts`).
- The scammer bubble appears without waiting for the classifier. With a slow classifier stub (over 3 seconds), the planned tactic's chip appears.

**Still open (to check during the build, not blocking approval):**
- Whether `response_format: json_object` is accepted on `gpt-oss-20b`. If it isn't, use JSON requested in the prompt only, with validation.
- Whether the 8-second timeout is comfortable given gpt-oss latency on Groq.
