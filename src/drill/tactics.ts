// Tactic IDs, meter points, and the fictional payment details — the language-free part.
// All the words (names, chip explanations, tips) live in src/i18n/strings.ts, written by us, never by the AI.

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

export const TACTIC_INFO: Record<Tactic, { points: number }> = {
  AUTHORITY: { points: 10 },
  FEAR: { points: 10 },
  URGENCY: { points: 15 },
  SECRECY: { points: 15 },
  ISOLATION: { points: 15 },
  OTP: { points: 20 },
  PAYMENT: { points: 25 },
};

// Fictional payment details. Shown on the Pay card and used to fill {AMOUNT} / {ACCOUNT},
// so the chat and the card always match. The AI never writes these numbers itself.
export const FAKE_PAYMENT = {
  amount: "₹2,50,000",
  account: "RBI-SAFE-0042-7781-3309",
} as const;
