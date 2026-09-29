# ScamDrill

**A fire drill for scams, set up by the family.**

An adult child sets up a safe, practice "digital arrest" scam for their elderly parent, using the family's own details. The parent chats with an AI "Inspector Sharma" who follows a real scam script, while every pressure tactic is named on screen as it happens. The parent wins by hanging up or calling family, and loses by sharing the fake OTP or tapping Pay. The report card goes back to the child.

<p align="center">
  <img src="docs/screenshots/setup.png" width="190" alt="Setup: the child enters the family's details" />
  <img src="docs/screenshots/drill.png" width="190" alt="The drill: a fake OTP SMS arrives while each scammer message is tagged with its tactic and the pressure meter rises" />
  <img src="docs/screenshots/ending.png" width="190" alt="Ending: 'This is how it happens to careful people', with the exact message highlighted and the 1930 helpline" />
  <img src="docs/screenshots/report.png" width="190" alt="Report card for the child: outcome, time on the line, tactics faced and the moment of the slip" />
</p>
<p align="center"><sub>Setup (child) → the drill (parent) → the parent's ending → the child's report card. The names shown are the built-in demo details.</sub></p>

> Training drill only. Everything in ScamDrill is fictional: the officer, the OTP, the account number. It never asks for, sends or stores real personal or financial data.

## Why

- Indians lost **₹1,935 crore** to "digital arrest" scams in 2024 (government data, reported by Inc42). Elderly people are heavily targeted.
- Warnings forwarded on WhatsApp tell people about scams, but they don't build the **reflex to hang up**. Practice does. Everyone knows a fire drill is a drill, but people still learn the exit route. Research on psychological inoculation ("prebunking", e.g. the Cambridge *Bad News* game) shows that experiencing a weakened version of a manipulation tactic improves resistance to the real thing.
- Existing tools (senior safety simulators, quiz-style training) are generic. ScamDrill differs in three ways:
  1. **The family sets it up with real personal details.** These are what make real scams convincing.
  2. **The role-play is open-ended,** not multiple choice.
  3. **The report card goes to the child,** so practising becomes a family habit.

## How it works

1. **Setup (child):** the child enters the parent's name, their bank, a grandchild's name and a safe contact, or taps *Use demo details*.
2. **Handoff:** the child passes the phone over. The parent sees "This is only practice. Nobody real is calling."
3. **The drill (parent):** Inspector Sharma messages the parent over 10 escalating stages: authority, accusation, arrest warrant, "don't tell your family", a fake OTP SMS, a threat to the grandchild, then a "Transfer to RBI safe account" card.
   - Every message gets an amber **red-flag chip** that names the tactic, and a **pressure meter** rises.
   - **Hang up** and **Call [family]** are always on screen.
4. **Ending (parent):** a kind, teaching screen. A win shows three facts. A loss says "This is how it happens to careful people" and highlights the exact message they gave in to. Every ending shows the real-life step: *hang up, call **1930** or report at **cybercrime.gov.in***.
5. **Report card (child):** the outcome, time on the line, the tactics faced and never reached, the moment of the slip, and one tip to practise next.

## The AI pipeline (two steps, and the app is the referee)

| Step | Where | What it does |
|---|---|---|
| Pace and rules | Browser (`src/drill/reducer.ts`) | A fixed 10-stage script. One reply equals one stage. The meter, the endings and the fake OTP and Pay events are **plain code, not AI**. |
| 1. Actor | `gpt-oss-120b` on **Groq** (`/api/scammer`) | Writes Inspector Sharma's next 1–3 sentences for the current stage's *beat*, reacting to what the parent said. |
| 2. Labeller | `gpt-oss-20b` on **Groq** (`/api/classify`) | Labels each line with one of 7 tactics (JSON, checked against the tactic list). A line that uses the payment placeholders is labelled PAYMENT by a simple rule. |
| Fallbacks | Browser | Every stage has a canned line, and every label falls back to the stage's planned tactic. If the AI is slow (over 8 s for a line, over 3 s for a label), refuses, or fails, the drill carries on. The parent never sees an error. |

**Designing the prompt so the model will play the scammer.** The system prompt (`server/prompts.ts`) opens with the purpose and consent: *"a consented family safety training simulation"* in which the user knows it's a drill and every tactic is named. It frames Sharma as a fictional character who delivers one short beat at a time. It never asks the model to "run a scam". The model may not write any digits, codes, accounts, links or real agency contacts. Amounts and accounts appear only as `{AMOUNT}` and `{ACCOUNT}`. A code-level output check (`checkScammerOutput`) enforces this too. Live test: **10 of 10 stages in character, 0 refusals, median about 0.7 s**. Run it yourself with `npm run test:refusal`.

## Safety and privacy by design

- A **"TRAINING DRILL – not a real call"** strip is visible on every screen.
- **Real names never leave the browser.** Everything sent to the AI uses placeholders such as `{PARENT}` and `{BANK}`, including what the parent types ("Can I call Rahul?" is sent as "Can I call {SAFE_CONTACT}?"). An automated test checks that no family detail appears in any request.
- **A safety guard in the browser** blocks real-looking sensitive numbers (Aadhaar, card, PAN, "PIN 4521", and a bare code after the fake SMS) *before* anything is sent, and ends the drill with a gentle warning. Years, amounts and phone numbers pass through.
- **Code decides the outcome, not the AI.** The drill is lost only when the parent types the exact fake OTP, tries to share a code, or taps Pay.
- **Nothing is stored.** There are no accounts and no database. A refresh starts over. Setup includes turning on Groq Zero Data Retention.

## Run it

Requirements: Node 20 or later, and a free [Groq API key](https://console.groq.com/keys).

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env, then add AI_API_KEY
npm run test:refusal        # optional: confirm the model plays the role
npm run dev                 # open http://localhost:5173
```

- **Demo mode, with no API key needed:** http://localhost:5173/?demo=1 runs the whole drill on the canned lines.
- **Tests:** `npm test` runs the unit tests for the safety guard, the drill rules, the placeholders and privacy, the report card, and the output check.
- **Backup provider:** Gemini's OpenAI-compatible endpoint can be swapped in through `.env`. See `.env.example`.

## Stack

Vite + React + TypeScript (plain CSS, Noto Sans) · Node + Express · the `openai` SDK pointed at Groq · Vitest.

```
server/        Express routes, Groq client + output check, prompts
src/drill/     pure logic: script, tactics & tips, reducer, safety guard, placeholders, API client, report
src/screens/   Setup · Handoff · Drill · Ending · Report card
src/components/ phone frame, chat bubble, tactic chip, pressure meter, OTP banner, Pay card, …
devpost/       planning docs: scope.md, prd.md, spec.md, checklist.md
```

## How it was built

Built with the **Devpost Learn "Build With AI: Basics" skill pack**. The planning came first, then the build proceeded in small tested slices:

- [`devpost/scope.md`](devpost/scope.md): the idea, who it's for, and what's in and out of the proof of concept.
- [`devpost/prd.md`](devpost/prd.md): every screen, behaviour, ending and safety rule, with acceptance criteria.
- [`devpost/spec.md`](devpost/spec.md): the technical blueprint (stack, components, data flow, failure modes).
- [`devpost/checklist.md`](devpost/checklist.md): the build slices, and a record of every change the build forced on the plan.

### AI tools used

- **Claude Code** (Anthropic) interviewed me through the planning docs and wrote code under my direction. I made the product and technical decisions and reviewed each slice.
- **Groq**, running OpenAI's open-weight **gpt-oss-120b** (the scammer's dialogue) and **gpt-oss-20b** (the tactic labels), is the AI inside the app.

## License

[MIT](LICENSE)
