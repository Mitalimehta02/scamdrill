// Tactic names, meter points, and all fixed teaching text.
// Written by us, never by the AI, so safety advice is always accurate (prd.md > Product Decisions).

export const TACTICS = [
  "AUTHORITY",
  "FEAR",
  "URGENCY",
  "SECRECY",
  "ISOLATION",
  "OTP",
  "PAYMENT",
] as const;

export type Tactic = (typeof TACTICS)[number];

export function isTactic(value: unknown): value is Tactic {
  return typeof value === "string" && (TACTICS as readonly string[]).includes(value);
}

export const METER_CAP = 100;

export const TACTIC_INFO: Record<Tactic, { points: number; explanation: string; tip: string }> = {
  AUTHORITY: {
    points: 10,
    explanation: "Claims to be police or CBI. Real officers never investigate anyone over a call.",
    tip: "Practise saying \"I will call the police station myself\" and hanging up. A real officer won't mind.",
  },
  FEAR: {
    points: 10,
    explanation: "Scary news about you or your family makes it hard to think clearly.",
    tip: "Agree together: frightening news on a call is a signal to hang up and call family, not to act.",
  },
  URGENCY: {
    points: 15,
    explanation: "Rushing you. Real legal processes never demand action within minutes.",
    tip: "Make a family rule: any call that says \"act now\" gets a hang-up and a call to family first.",
  },
  SECRECY: {
    points: 15,
    explanation: "\"Don't tell your family\" is there so no one can warn you.",
    tip: "Make it a family rule: anyone who says \"don't tell your family\" is a scammer.",
  },
  ISOLATION: {
    points: 15,
    explanation: "Keeping you on the line so you can't pause, check, or call someone.",
    tip: "Practise hanging up mid-sentence. It isn't rude when someone is pressuring you.",
  },
  OTP: {
    points: 20,
    explanation: "Asking for the code sent to your phone. No official ever needs your OTP.",
    tip: "Put a note by the phone: \"Never read out an OTP — not to the bank, police, or anyone.\"",
  },
  PAYMENT: {
    points: 25,
    explanation: "A \"safe account\" doesn't exist. No agency asks you to move money.",
    tip: "Agree together: no money moves after a phone call without talking to family first.",
  },
};

// Fictional payment details. Shown on the Pay card and used to fill {AMOUNT} / {ACCOUNT},
// so the chat and the card always match. The AI never writes these numbers itself.
export const FAKE_PAYMENT = {
  amount: "₹2,50,000",
  account: "RBI-SAFE-0042-7781-3309",
} as const;
