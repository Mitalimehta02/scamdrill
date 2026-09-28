// The fixed 10-stage drill script. The app controls the pace; the AI only writes dialogue
// for the current beat. Every stage has a canned line so the drill never breaks
// (prd.md > Drill Script and Pacing, prd.md > Resilience and Demo Mode).
// Text uses placeholders ({PARENT}, {BANK}, ...) that are filled in only in the browser.

import type { Tactic } from "./tactics";

export type StageEvent = "otp" | "pay";

export interface Stage {
  /** Instruction for the AI: what this message must accomplish. */
  beat: string;
  /** Used when the classifier fails, is invalid, or is too slow. */
  plannedTactic: Tactic;
  /** Used when the scammer AI call fails, is refused, or is too slow — and always in demo mode. */
  cannedLine: string;
  /** Something the app shows when this stage begins. */
  event?: StageEvent;
}

export const STAGE_COUNT = 10;

export const STAGES: Record<number, Stage> = {
  1: {
    beat: "Introduce yourself as Inspector Sharma of the CBI Cyber Cell and say you are calling about a serious official matter concerning them.",
    plannedTactic: "AUTHORITY",
    cannedLine:
      "Hello, am I speaking with {PARENT} ji? This is Inspector Sharma from the CBI Cyber Cell. I am calling about a very serious official matter.",
  },
  2: {
    beat: "Claim their Aadhaar has been linked to a money-laundering case involving an account at {BANK}.",
    plannedTactic: "AUTHORITY",
    cannedLine:
      "{PARENT} ji, your Aadhaar has been linked to a money-laundering case. Large amounts have moved through an account in your name at {BANK}.",
  },
  3: {
    beat: "Say an arrest warrant has already been issued in their name and they must act immediately to avoid arrest.",
    plannedTactic: "URGENCY",
    cannedLine:
      "An arrest warrant has already been issued in your name. If you do not cooperate right now, the local police will come to your home today.",
  },
  4: {
    beat: "Insist the matter is confidential: they must not tell anyone, including family, and must stay on this call until verification is complete.",
    plannedTactic: "SECRECY",
    cannedLine:
      "This is a confidential matter of national security. Do not tell anyone, not even your family. Stay on this call until verification is complete.",
  },
  5: {
    beat: "Say a verification code has just been sent to their phone and demand they read it out to you now to stop the warrant.",
    plannedTactic: "OTP",
    cannedLine:
      "We have just sent a verification code to your phone. Read the code to me now so I can confirm your identity and stop the warrant.",
    event: "otp",
  },
  6: {
    beat: "Add pressure: their grandchild {GRANDCHILD} could also be questioned if they delay.",
    plannedTactic: "FEAR",
    cannedLine:
      "If you delay, your grandchild {GRANDCHILD} may also be called for questioning. Family members are linked to this account.",
  },
  7: {
    beat: "Tell them to transfer {AMOUNT} to the RBI safe account {ACCOUNT} shown on their screen to prove their innocence, and say it will be refunded after verification.",
    plannedTactic: "PAYMENT",
    cannedLine:
      "To prove your innocence, transfer {AMOUNT} to the RBI safe account {ACCOUNT} shown on your screen. It will be refunded after verification.",
    event: "pay",
  },
  8: {
    beat: "Escalate urgency: every minute of delay makes the case worse. Push them to complete the transfer now.",
    plannedTactic: "URGENCY",
    cannedLine:
      "Why are you hesitating, {PARENT} ji? Every minute you delay makes your case worse. Complete the transfer now.",
  },
  9: {
    beat: "Isolate them: tell them not to disconnect or call anyone, especially {SAFE_CONTACT}, or that person will be named in the case too.",
    plannedTactic: "ISOLATION",
    cannedLine:
      "Do not disconnect and do not call anyone. If you speak to {SAFE_CONTACT}, they will also be named in this case.",
  },
  10: {
    beat: "Final ultimatum: make the payment to the safe account now, or the arrest team will be sent.",
    plannedTactic: "PAYMENT",
    cannedLine:
      "This is your final chance, {PARENT} ji. Make the payment to the safe account now, or the arrest team will be sent to your home.",
  },
};

export const NUDGE_BEAT =
  "The user has gone silent. Send one short line demanding they respond and not disconnect.";
export const NUDGE_LINE = "Hello? {PARENT} ji, do not disconnect. This is a serious matter.";
export const NUDGE_TACTIC: Tactic = "ISOLATION";
