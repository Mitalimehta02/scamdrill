---
doc: prd
status: approved
---

# ScamDrill — Product Requirements

A fire drill for scams, set up by the family. An adult child sets up a safe practice "digital arrest" scam on their own phone and hands it to their elderly parent. The parent practises escaping it, and the child gets a report card.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. **The child opens ScamDrill** and sees the Setup screen.
2. **The child fills in the family details,** or taps **Use demo details**, then taps **Hand to [Parent]**.
3. **The Handoff screen** tells the parent it is a practice drill and shows a big **Start practice** button. The parent taps it and the timer starts.
4. **The drill.** "Inspector Sharma, CBI Cyber Cell" messages the parent. Each scammer message appears with a red-flag chip that names the tactic and explains it in one line, and the pressure meter rises. The parent types replies freely. Each reply advances the drill one stage through a fixed 10-stage script. At stage 5 a fake OTP SMS slides in, and at stage 7 a "Transfer to RBI safe account" Pay card appears.
5. **The drill ends** in one of four ways:
   - **Win:** the parent taps **Hang up** or **Call [safe contact]**.
   - **Loss:** the parent types the fake OTP, types another code or personal number (the message is blocked), or taps **Pay**.
   - **Partial:** stage 10 ends and the parent is still on the line.
6. **The parent's ending screen** shows a calm, teaching message and real-life steps (1930 and cybercrime.gov.in).
7. The parent taps **Hand back to [child]**, which opens **the child's Report card**: outcome, time, tactics faced and not reached, the "moment" (if lost), and one fixed tip.
8. **Run another drill** returns to Setup, keeping the details that were entered.

## Screens and Layout
Five screens. On a laptop, everything is shown centred in a phone-sized frame, so the demo looks like a phone app.

1. **Setup (child):** a clean, trustworthy family-safety form.
2. **Handoff (parent):** "This is a practice drill set up by [child]. Nobody real is calling." A big **Start practice** button.
3. **Drill (parent):** a messaging-chat layout, described under `Features and Behavior > The Drill Screen`.
4. **Ending (parent):** a full-screen card for win, loss or partial.
5. **Report card (child):** the family-safety app style again.

The **"TRAINING DRILL – not a real call"** strip is visible on every screen. (`scope.md > The POC Boundary`)

## Look and Feel
- **Mobile-first.** On a laptop, the app is shown inside a centred phone-sized frame.
- **Drill screen:** looks like a familiar messaging chat (bubbles, a header with the caller's name and a generic "official" avatar, a typing indicator), because real digital arrest scams happen over WhatsApp or Skype. It uses **our own branding**: no WhatsApp logos, names or exact colours.
- **Palette:** calm and serious. Deep navy/slate with off-white, **one amber accent** for warnings (the training strip and red-flag chips), **green only for success**, and red for the Hang up button and the top of the pressure meter (the meter shifts slate → amber → red as it fills, so rising pressure is visible on camera).
- **Accessible for elderly users:** base text **18px or larger**, high contrast, big tap targets, no tiny text.
- **Font:** Noto Sans, which also supports Devanagari for later Hindi.
- **Setup and Report card** look like a clean, trustworthy family-safety app, not a game. The ending screens are kind rather than alarming, with no red "FAILED" screen.

## Features and Behavior

### Family Setup
Source: `scope.md > What "Working" Looks Like`.
- Fields:
  - the child's name, used in "Hand back to [child]"
  - the parent's name
  - the parent's bank (free text, placeholder "e.g. SBI, HDFC")
  - the grandchild's name
  - the safe contact name, plus an optional relation (e.g. "Rahul" + "son"). The button then reads "Call Rahul (son)".
  - language: **English, हिन्दी (Hindi) or Hinglish**. Choosing one switches the whole interface immediately (see `Languages`).
- **Use demo details** fills every field with fictional values in one tap.
- **Hand to [Parent]** is enabled only when all the fields are filled.
- A line under the form: "Use first names only. ScamDrill never asks for real account numbers, OTPs or ID numbers, and stores nothing."
  - [ ] Tapping **Use demo details** fills every field, and the button label updates to "Hand to [demo parent name]".
  - [ ] With any field empty, **Hand to [Parent]** is disabled.
  - [ ] All three languages can be selected, and the Setup screen itself switches language straight away.

### Languages
Source: `scope.md > The POC Boundary` (moved from Later in slice 5).
- **English, हिन्दी (Devanagari) and Hinglish (Hindi in Roman letters, as people text on WhatsApp).** The chosen language applies to every screen: Setup, Handoff, the drill (header, buttons, OTP SMS, Pay card, chips), the endings and the report card.
- **Inspector Sharma speaks the chosen language.** In Hindi he addresses the parent as "{PARENT} जी", and in English or Hinglish as "{PARENT} ji". Family names appear exactly as typed in Setup, even inside Hindi text.
- **Canned lines, chip explanations, tips, win facts and the 1930 / cybercrime.gov.in card exist in all three languages.** They are written by us, and the Hindi and Hinglish versions are **pending native review** by the learner.
- **The parent may reply in any language or script.** Replies go through the same safety guard.
- **Known limitation:** placeholders only catch names written the way they were typed in Setup. A name typed in another script (e.g. "राहुल" for "Rahul") is not replaced and would reach the AI provider (Groq, with Zero Data Retention on).
  - [ ] Choosing हिन्दी gives a drill where Sharma's lines, the chips, the buttons, the ending and the report card are all in Hindi, with no English left over except names and the BANK-OTP sender.
  - [ ] Hinglish gives Roman-script Hindi throughout.
  - [ ] Hindi text renders cleanly (Noto Sans Devanagari) at 18px or larger.
  - [ ] `npm run test:refusal -- hi` and `-- hinglish` keep Sharma in character, with the placeholders kept.

### Handoff
- Shows the parent's name, says the drill was set up by [child], says nobody real is calling, and has a large **Start practice** button. The drill timer starts when the button is tapped.
  - [ ] Tapping **Start practice** opens the drill, and the first scammer message arrives after a typing indicator.

### The Drill Screen
- **Header:** "Inspector Sharma, CBI Cyber Cell" (showing "typing…" while he writes), a generic official avatar, an **"● On call 02:14" timer** (the same clock gives the report card its time on the line), and the **pressure meter** bar directly underneath.
- **Chat:** scammer bubbles on the left, parent bubbles on the right, each with a small timestamp, and a typing indicator while the scammer is "writing". When a chip arrives, it slides in (about 300ms) and its bubble glows amber briefly: the "reveal" moment.
- **Red-flag chip** under each scammer bubble: an amber chip with the tactic name (AUTHORITY, FEAR, URGENCY, SECRECY, ISOLATION, OTP, PAYMENT) and a one-line explanation.
- **Always visible at the bottom:** a large red **Hang up** and a large green **Call [safe contact]**, above the text box.
- **Quick replies** (added after the judge review): 2 large tappable replies in one row, in the chosen language, above the text box: "Who is this?" and "Let me ask Rahul first" (using the safe contact's name). Tapping one sends it exactly like a typed reply: safety guard → placeholders → next stage. Typing still works. This lowers the typing burden for elderly users.
- **Reply length:** the text box accepts at most 300 characters and shows a character count near the limit. A longer reply would be rejected by the server and silently force canned lines for the following stages.
- **Read-aloud (optional, off by default):** a speaker toggle in the header reads Sharma's lines aloud with the browser's built-in voice (Hindi voice for Hindi; Indian English for English and Roman-script Hinglish). The toggle is hidden if no suitable voice exists. No new dependency.
- The scammer uses the family's details: the parent's name, bank and grandchild's name. It addresses the parent as **"[Parent name] ji"** (e.g. "Kamala ji"), which is respectful, gender-neutral and personal. It falls back to "Sir/Madam" only if the name is empty.
  - [ ] Every scammer message shows at least one tactic chip with an explanation.
  - [ ] The scammer's messages mention the family's bank (stage 2) and the grandchild's name (stage 6).
  - [ ] Hang up and Call are visible and tappable at every point in the drill without scrolling.
  - [ ] Tapping a quick reply advances the drill exactly like typing it. A quick reply never contains a number, so it can never trigger the safety guard.
  - [ ] A 300-character reply goes through, and the next scammer line still comes from the AI (no fallback).

### Drill Script and Pacing
Source: `scope.md > How the Drill Stays Reliable`.
- **The app controls the pace; the AI writes only the dialogue.** There are 10 fixed stages, each with a planned tactic:

  | Stage | Beat | Planned tactic |
  |---|---|---|
  | 1 | Intro: "Inspector Sharma, CBI Cyber Cell" | AUTHORITY |
  | 2 | Aadhaar linked to a money-laundering case at [bank] | AUTHORITY / FEAR |
  | 3 | Arrest warrant, act now | URGENCY |
  | 4 | "Don't tell anyone, stay on this call" | SECRECY / ISOLATION |
  | 5 | **Fake OTP SMS appears**, and the scammer demands the code | OTP |
  | 6 | [Grandchild] could be affected | FEAR / URGENCY |
  | 7 | **Pay card appears**: "Transfer to RBI safe account" | PAYMENT |
  | 8–10 | Escalation | as tagged |

- **Each parent reply advances the drill one stage.** The scammer responds naturally to what the parent said, then delivers the next beat.
- **Silence:** after 25 seconds with no reply, the scammer sends one nudge ("Hello? [Parent name] ji, do not disconnect. This is a serious matter."), tagged ISOLATION. A nudge does not advance the stage, and there is at most one nudge per stage.
- The OTP SMS and the Pay card appear **as soon as their stage begins**, not on a timer.
  - [ ] Across repeated runs, the OTP SMS always appears at stage 5 and the Pay card at stage 7.
  - [ ] Waiting 25 seconds without replying produces exactly one nudge, and waiting longer produces no second nudge in that stage.

### Tactic Tagging and Pressure Meter
- The tag for each scammer message comes from a **second AI step (the classifier)**. If the classifier fails or returns something unusable, the app uses the **stage's planned tactic**.
- **The meter** adds fixed points per tactic and never reads the parent's replies. The proposed values are AUTHORITY +10, FEAR +10, URGENCY +15, SECRECY/ISOLATION +15, OTP +20, PAYMENT +25, capped at 100. The final values are set in the spec.
  - [ ] The meter only ever rises, never exceeds 100, and rises by the same amount for the same tactic.
  - [ ] When the classifier is forced to fail, chips still appear, showing the planned tactic.

### Fake OTP and Pay Card
- **OTP:** at stage 5, a banner notification slides down from the top, like an SMS from "BANK-OTP", with a random 6-digit code generated for this drill. It stays accessible, for example by tapping it again.
- **Pay card:** at stage 7, a realistic but clearly fictional card appears in the chat: "RBI Safe Account", a fake account number, an amount, and a **Pay** button.
  - [ ] The OTP is different on each new drill.
  - [ ] Tapping **Pay** immediately ends the drill as a Loss (sent money).

### Endings (Deterministic)
Source: `scope.md > What "Working" Looks Like`. The AI never decides the outcome.

| Ending | Trigger | Label |
|---|---|---|
| Win | Tapping Hang up or Call [safe contact] at any time | "Hung up" / "Called [safe contact]" |
| Loss | The parent's reply contains the exact fake OTP | "Shared the OTP" |
| Loss | The parent's reply matches a blocking rule (see `Safety Guard`) | "Tried to share a code or personal number" |
| Loss | Tapping **Pay** | "Sent money" |
| Partial | Stage 10 completes and the parent is still on the line | "Stayed on the line too long" |

"Call [safe contact]" does not dial anything; it is a practice action.
  - [ ] Each of the four ending types can be reached on purpose in a demo run, and each shows the correct label.

### Parent Ending Screen
Kind and teaching, never shaming. Every ending screen has a **Hand back to [child]** button at the bottom.
- **Win:** "You hung up. That's exactly right." Three facts:
  - Real police or CBI never arrest anyone over a call.
  - "Digital arrest" doesn't exist in Indian law.
  - No official ever asks for your OTP.

  Then: "In real life: hang up, then call **1930** (National Cyber Crime Helpline) or report at **cybercrime.gov.in**."
- **Loss:** "This is how it happens to careful people. Here's the moment:" This is followed by **the exact scammer message they gave in to**, highlighted, with its tactic named and explained in one line, then the same real-life steps. For a blocked sensitive number, add: "Please never type real details, even in practice. In a real call, this is exactly what they want."
- **Partial:** "You didn't give anything away, but you stayed on the line for 10 messages. Next time, hang up at the first threat." Then the real-life steps.
  - [ ] A loss screen shows the correct scammer message (the last one before the slip) with its tactic.
  - [ ] No ending screen uses the words "failed", "fraud" or "stupid", and none uses a red failure style.

### Report Card (Child)
- Contents:
  - the outcome and its label
  - time on the line
  - the number of scammer messages before the exit
  - the **tactics faced** (checked)
  - the **tactics never reached**, greyed out as "the scammer never got to use these"
  - the **moment**, if the parent lost
  - **one tip**
- **Tips are fixed, written by us:** one per tactic and one per ending. There is no AI-generated safety advice.
  - After a loss, the tip is the one for the tactic active at the slip.
  - After a win or partial, it's the tip for the highest-pressure tactic they faced.
- **Ending the call (Hang up or Call) after one message** shows as the best result: "Instant reflex: ended the call after 1 message." All the other tactics are greyed out.
- **Run another drill** returns to Setup with the details kept.
  - [ ] Hanging up after one message shows "Instant reflex", with only AUTHORITY checked and the rest greyed out.
  - [ ] The time and message count match the drill that was just played.

### Resilience and Demo Mode
- **Every stage has a canned fallback line** written in advance, in the scammer's voice, with the stage's planned tactic. If the AI call fails, is refused, or takes more than about 8 seconds, the canned line is used. The parent never sees an error.
- After **3 AI failures in a row**, a small, non-alarming note appears: "Running in offline practice mode". The drill continues on canned lines.
- **Demo mode** (for example `?demo=1`) runs the whole drill on canned lines with no API. It's a safety net for recording the video.
- **Static demo build** (slice 5): a separate build that *only* runs demo mode. It makes no `/api` calls, needs no key and runs with no server, and shows a subtle "Demo mode: scripted lines" note so judges know it isn't the live AI. It can be deployed as a public "try it" link.
  - [ ] With the network off or no API key, a full drill still completes on canned lines, with no error shown.
  - [ ] Demo mode completes a full drill with no API calls.
  - [ ] The static demo build, served from plain files with no Node server running, completes a full drill in all three languages and shows the demo-mode note.

### Safety Guard
Source: `scope.md > The POC Boundary`.
- **Before any parent message is sent to the AI,** the browser checks it in this order:
  1. **Exact fake OTP** → Loss, "Shared the OTP".
  2. **Always blocked** (at any stage) → Loss, "Tried to share a code or personal number":
     - a 12-digit Aadhaar pattern (with or without spaces)
     - a 13–19 digit card number
     - a PAN (format ABCDE1234F)
     - "PIN", "CVV", "OTP" or "code" followed by digits
  3. **A 4–6 digit number (not the fake OTP) that looks like a code** → the same loss. This applies only if:
     - **(a)** it's stage 5 or later (the fake SMS has appeared) **and** the reply is mostly just that number (e.g. "482913", "ok 482913"), or
     - **(b)** it appears next to code words (OTP, code, PIN, password, CVV), at any stage.
- **Never blocked. These are sent to the AI normally, because they aren't sensitive:**
  - **Phone numbers** (+91 or 10-digit mobile patterns). These are not treated as Aadhaar or card numbers.
  - **Amounts** with ₹, Rs or rupees.
  - **Years** 1900–2099 next to words like born, year or since.
  - **Numbers in a normal sentence outside the OTP stage** (e.g. "my flat is 1204").
- **Other scripts' digits count as digits** (slice 5). Devanagari numerals (०१२३४५६७८९) and other Indian-script digits are converted to 0–9 before every check, both in this guard and in the server's output check on Sharma's lines. Code words include Hindi ones (कोड, ओटीपी, पिन, पासवर्ड), and amounts or years can be marked in Hindi or Hinglish (रुपये/rupaye, साल/saal, जन्म/janm).
- **If there's a match,** the message is **blocked**. It is never sent to the AI or stored, the text box is cleared, and the drill ends with the matching loss.
- **Always:**
  - a permanent training strip
  - only fictional officer names, fake OTPs and fake account numbers
  - the scammer's AI instructions framed as a consented training simulation
  - nothing is persisted after the session
  - the API key is never exposed in the repo
  - the scammer never uses the words "fraud", "fabricated" or real agency contact details
  - [ ] Typing "1234 5678 9012" ends the drill as "tried to share…", and that text never appears in any request to the AI.
  - [ ] Typing the exact fake OTP ends the drill as "Shared the OTP".
  - [ ] "I was born in 1952", "my flat is 1204", "I only have ₹5000" and "call me on +91 98765 43210" do **not** end the drill.
  - [ ] "482913" typed after the OTP SMS has appeared **does** end the drill as "tried to share a code or personal number".
  - [ ] "my PIN is 4521" ends the drill at any stage.
  - [ ] "४८२९१३" typed after the SMS ends the drill, and a 12-digit Aadhaar number written in Devanagari is blocked.
  - [ ] "OTP bata raha hoon 482913" and "code hai 482913" end the drill. "mera flat 1204 hai" and "₹5000 hi hain" do not.
  - [ ] A scammer line from the AI that contains Devanagari digits is swapped for the canned line.

## States and Boundaries
- **First use:** Setup is empty, and "Use demo details" is the fastest path.
- **Waiting for the scammer:** a typing indicator is shown, and there is at most about 8 seconds before the canned fallback is used.
- **Offline or AI failure:** canned lines, with the small note after 3 consecutive failures. No error screens.
- **Leaving mid-drill (refresh or closing the tab):** everything resets to Setup. Nothing persists, and this is intended.
- **After the drill:** once the report card is shown, the drill can't be resumed. "Run another drill" starts fresh with the setup details kept for this session only.

## Product Decisions
- **The app sets the pace, and the AI writes only the dialogue.** This makes the OTP and Pay moments reliable on camera.
- **Losing is detected by code, never judged by the AI.** Outcomes are explainable, and the AI never judges a person.
- **The meter is driven only by tactic tags.** It's predictable and never reads the parent's replies.
- **Tips and the canned lines are fixed and written by us.** Safety advice is always accurate, and the drill never breaks.
- **The parent's moment comes before the child's report card.** The person holding the phone learns at the moment it happens.
- **No shame on losses.** "This is how it happens to careful people" teaches instead of punishing.
- **Typing any real-looking number counts as a loss.** "The behaviour is what matters." The number is blocked before it leaves the browser.
- **English, Hindi and Hinglish in the proof of concept** (changed in slice 5). The target user is an elderly Indian parent, so English only wasn't believable. The learner will review the Hindi and Hinglish text.
- **One device passed from hand to hand.** No links, accounts or sync.
- **Mobile-first, shown in a phone frame on a laptop,** so the video looks like a phone app.

- **The safety guard blocks clearly sensitive patterns always, and short numbers only when they look like a code.** False losses on years, amounts or addresses would be unfair to the parent and would break the demo.
- **Setup has a "Your name" field for the child,** because "Hand back to [child]" needs it.
- **The safe contact is a name with an optional relation** ("Call Rahul (son)"). No phone number is collected, because Call never dials.
- **The bank is free text** ("e.g. SBI, HDFC").
- **The scammer addresses the parent as "[Parent name] ji".** It's respectful, gender-neutral and personal, and it avoids a gender field.

## What We're Building
- Five screens: Setup, Handoff, Drill, Ending, Report card. All are inside a phone frame and always show the training strip.
- A 10-stage script that advances on each reply, with one nudge per stage after 25 seconds of silence.
- The scammer's AI dialogue, personalised with the family's details, with a canned line for every stage.
- An AI classifier for tactic tags with a fallback to the planned tactic, the chips, and the pressure meter.
- The fake OTP banner (stage 5) and the Pay card (stage 7).
- Four deterministic endings, the parent's ending screens, and the child's report card with fixed tips.
- The safety guard in the browser.
- The "offline practice mode" note and `?demo=1` demo mode.
- English, Hindi and Hinglish throughout (a strings dictionary, per-language canned lines, the scammer's language).
- A static demo-mode build for a public "try it" link.
- A real-user test kit (`devpost/user-test.md`) for the learner's own consented test with an elderly relative. It's a document, not app behaviour.

## Deferred From the POC
- **Grandparent-scam scenario:** a second script. It's out until the first one is polished.
- **Voice mode:** speech adds latency and reliability risk.
- **Sending the drill to another phone by link:** needs hosting and a shared state between devices.
- **Drill history and progress over time:** needs storage, which goes against "store nothing" for the proof of concept.

## Possible Later Enhancements
- Difficulty levels (a subtler scammer, fewer chips shown live).
- More scam scripts: fake courier/customs, KYC update, electricity disconnection.
- A shareable summary the child can send to siblings.

## Non-Goals
- **Accounts, login, databases:** not needed to prove the drill works.
- **Real calls or SMS:** unsafe and legally risky.
- **AI-generated safety advice:** accuracy matters more than variety.
- **The AI judging the outcome:** endings are deterministic.
- **Collecting or storing any real personal or financial data.**
- **A game-show feel** (points, leaderboards, confetti): the tone is calm and serious.

## Open Questions
- **Exact meter point values:** to be finalised in `4-spec`. Nothing else blocks the spec.
