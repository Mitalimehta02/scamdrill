---
doc: scope
status: approved
---

# ScamDrill

A fire drill for scams, set up by the family: an adult child configures a safe practice "digital arrest" scam for their elderly parent, the parent practises escaping it, and the child gets a report card.

## The Unique Kernel
A **family-personalized, open-ended scam rehearsal** that trains the exit reflex rather than knowledge. The scammer uses the family's own details (the parent's bank, the grandchild's name), every tactic is named live as it's used, and losing is detected **deterministically** (the parent typed the fake OTP, or tapped Pay), not guessed by the AI. The report card goes back to the child, so safety becomes a family habit rather than a one-off quiz.

Why practice works even though the parent knows it's a drill: "Fire drills work the same way — everyone knows it's a drill, but the body learns the exit route." Scammers win through panic, authority and isolation, not clever arguments. Feeling a weakened version of those tactics under safe pressure builds resistance. This is psychological inoculation, or "prebunking", as in the Cambridge *Bad News* game studies (https://www.getbadnews.com). Personal details make it close enough to real for the lesson to stick.

## Who It's For
- **The child (setup + report card):** an adult in India whose elderly parent has a smartphone and a bank account and could get a "digital arrest" call. Today their only tool is forwarding WhatsApp warnings, which "don't build the reflex to hang up."
- **The parent (the drill):** an elderly person who picks up calls from officials and trusts authority. Today they get no practice until the real call comes.

## The Core Loop
The child fills in a short setup form and taps **"Hand to [Parent]"**. The parent taps **Start practice** on the same device. They chat with "Inspector Sharma, CBI Cyber Cell", who escalates pressure. Each scammer message is tagged with a red-flag chip (AUTHORITY, URGENCY, SECRECY, ISOLATION, PAYMENT) and a one-line explanation, and a pressure meter rises. The parent wins by tapping **Hang up** or **Call [safe contact]**. They lose by typing the fake OTP or tapping Pay. The report card is handed back to the child.

They come back because the report card suggests one tactic to practise next time. Repeat drills are the habit.

## Inspiration & Identity
- A fire drill: calm, serious, safe, not a game show. A **"Training drill – this is not a real call"** banner is always visible.
- The drill should feel like a real phone chat, with an official-sounding officer, a fake SMS notification sliding in, and a payment card, so the pressure is felt.
- Prebunking research: Cambridge *Bad News* game (https://www.getbadnews.com).
- Existing tools it differs from: StopAiFraud Senior Safety Simulator and the OpenAI/AARP training, which are generic or quiz-style.

## Why This Matters to the Learner
"Digital arrest" calls have become common in India. Elderly relatives and family friends get them, and WhatsApp warnings don't build the reflex to hang up. Practice does. (The learner confirmed this story.) Indians lost ₹1,935 crore to digital arrest scams in 2024 (government data, reported by Inc42).

## What "Working" Looks Like
A stranger can go from setup to the drill to the report card, win or lose, with no errors, in under 3 minutes:
1. **Setup:** the child enters the parent's name, bank, grandchild's name and safe contact name, or taps **"Use demo details"**. The language field shows English, with Hindi and Hinglish marked "coming soon".
2. **Drill:** the scammer's messages arrive with tactic chips and explanations, and the pressure meter climbs. **Hang up** and **Call [safe contact]** are always visible.
3. **Endings:**
   - **Win:** the parent taps Hang up or Call.
   - **Lose, shared OTP:** a fake SMS with a 6-digit code slides in, the scammer asks for it, and the parent's reply contains the code.
   - **Lose, sent money:** the parent taps Pay on a "Transfer to RBI safe account" card.
   - **Partial:** neither happens within about 10 scammer messages. The result is "survived, but stayed on the line too long".
4. **Report card:** the outcome, time on the line, the tactics that appeared, the tactic that was active at the slip (if any), and one tip to practise next.

**The "oh, that's cool" moment:** the fake OTP SMS slides in while "Inspector Sharma" demands it, the URGENCY and SECRECY chips light up, and the pressure meter spikes. You can feel why real people give in, and you see the exit buttons right there.

## How the Drill Stays Reliable
- **The app sets the pace, not the AI.** The drill follows a fixed script of stages, and the app keeps track of the current stage: intro (authority), accusation at [their bank], arrest-warrant threat, "don't tell anyone, stay on the call", **fake OTP SMS**, [grandchild] could be affected, **Pay card**, then escalation to a "partial" ending. The AI only writes the dialogue for the current stage, responding naturally to what the parent typed. So the OTP and Pay moments happen at the same point in every run.
- **The pressure meter comes from the tactic tags**, with fixed points per tactic and a cap of 100. It never reads the parent's replies, so it's predictable.
- **Tags come from a second AI call (the classifier).** If that call fails or returns junk, the app falls back to the tactic planned for the current stage. The drill never breaks.
- Details go in the PRD and spec.

## The POC Boundary
- One scenario (digital arrest), text chat, one device passed between the child and the parent.
- **Three languages: English, हिन्दी (Hindi) and Hinglish (Hindi in Roman letters).** The scammer, the canned lines and all interface text follow the language chosen in Setup. *(Moved from Later in slice 5: an English-only drill isn't believable for an elderly Indian parent.)*
- Setup form with a "Use demo details" button, a handoff screen, the drill screen and the report card.
- Live tactic tagging with a one-line explanation, and a pressure meter.
- Deterministic endings (win, OTP loss, payment loss, partial).
- Safety: a permanent training banner; only fake OTPs, account numbers and officer names; no real personal or financial data asked for or stored; the scammer prompt is framed as a consented training simulation; the API key is kept in `.env` and gitignored.

## Later
- A grandparent-scam scenario, so US judges can relate.
- Voice mode.
- Sending the drill to the parent's own phone by link.
- Other Indian languages (Tamil, Bengali, Marathi…). The strings dictionary and per-language canned lines make this a translation job, not a redesign.

## Explicitly Cut
- **Accounts and login:** not needed to prove the drill works, and they add setup friction for the demo.
- **Databases and storage:** drill state lives in the session. Storing family details would also go against the "store nothing real" safety rule.
- **Real phone calls and SMS:** unsafe and legally risky; the in-app fake SMS proves the point.
- **Deployment of the live-AI version:** it would expose the API key's free-tier limit to strangers. Instead, a **static demo-mode build** (scripted lines only, no key, no server) gives judges a safe link to click. *(Added in slice 5.)*
- **AI-judged losing:** replaced by deterministic OTP and Pay detection, so outcomes are reliable and explainable.
