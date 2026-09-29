// The safety guard (prd.md > Safety Guard, spec.md > Safety Guard).
// Runs in the browser on every reply BEFORE anything is stored or sent.
// A match ends the drill as a loss, and the text never leaves the browser.
// Works in English, Hindi (Devanagari) and Hinglish: digits in any script are normalised first.

import { normalizeDigits } from "./digits";

export type GuardVerdict = "otp" | "sensitive" | "ok";

// "Not part of a word", for any script (\b only understands English letters).
const START = "(?<![\\p{L}\\p{M}\\p{N}])";
const END = "(?![\\p{L}\\p{M}\\p{N}])";
const word = (alternatives: string) => `${START}(?:${alternatives})${END}`;

const CODE_WORD = "pin|cvv|otp|code|password|passcode|कोड|ओटीपी|पिन|पासवर्ड";
const AMOUNT_BEFORE = new RegExp(`(?:₹|${START}(?:rs\\.?|inr|रु\\.?))\\s*$`, "iu");
const AMOUNT_AFTER = new RegExp(`^\\s*(?:\\/-|${word("rupees?|rupaye|rupay|rs|रुपये|रुपए|रुपया")})`, "iu");
const YEAR_WORDS = new RegExp(word("born|year|years|since|saal|sal|san|janm|janam|जन्म|साल|सन्|सन"), "iu");
const CODE_NEARBY = new RegExp(word(CODE_WORD), "iu");
// A code word followed, within three words, by 3+ digits: "my PIN is 4521", "OTP bata raha hoon 482913", "कोड है 4821".
const CODE_THEN_DIGITS = new RegExp(`${word(CODE_WORD)}[^\\p{L}\\p{M}\\p{N}]*(?:[\\p{L}\\p{M}]+[^\\p{L}\\p{M}\\p{N}]+){0,3}\\d{3,}`, "iu");

/** Joins digit groups split by spaces or dashes: "1234 5678 9012" → "123456789012". */
function joinDigits(text: string): string {
  return text.replace(/(?<=\d)[\s-]+(?=\d)/g, "");
}

/** Indian mobile numbers are never blocked: "+91 98765 43210", "98765-43210", "9876543210". */
function removePhoneNumbers(text: string): string {
  return text.replace(/(?:\+\s?91[\s-]*)?(?<![\d])[6-9]\d{4}[\s-]?\d{5}(?!\d)/g, " ");
}

/** "₹5000", "Rs. 5,000", "5000 rupees", "5000 रुपये", "5000/-" — amounts, not codes. */
function isAmount(text: string, index: number, length: number): boolean {
  const before = text.slice(Math.max(0, index - 8), index);
  const after = text.slice(index + length, index + length + 12);
  return AMOUNT_BEFORE.test(before) || AMOUNT_AFTER.test(after);
}

/** 1900–2099 next to "born", "year", "since", "saal", "जन्म"… — a year, not a code. */
function isYear(text: string, index: number, value: string): boolean {
  const n = Number(value);
  if (value.length !== 4 || n < 1900 || n > 2099) return false;
  return YEAR_WORDS.test(text.slice(Math.max(0, index - 20), index + 24));
}

/** Words (in any script) other than the number itself. */
function otherWordCount(text: string, number: string): number {
  return text
    .replace(number, " ")
    .split(/\s+/)
    .filter((w) => /\p{L}/u.test(w)).length;
}

export function checkReply(text: string, ctx: { fakeOtp: string; stage: number }): GuardVerdict {
  const normal = normalizeDigits(text); // "४८२९१३" → "482913"
  const joined = joinDigits(normal);

  // 1. The exact fake OTP (spaces or dashes ignored) → "Shared the OTP".
  if (new RegExp(`(?<!\\d)${ctx.fakeOtp}(?!\\d)`).test(joined)) return "otp";

  // 2. Take phone numbers out first: "+91 98765 43210" has 12 digits, the same as an Aadhaar number.
  const working = joinDigits(removePhoneNumbers(normal));

  // 3. Always sensitive, at any stage.
  if (/(?<!\d)\d{12,19}(?!\d)/.test(working)) return "sensitive"; // Aadhaar (12) or card (13–19)
  if (/\b[A-Z]{5}\d{4}[A-Z]\b/i.test(working)) return "sensitive"; // PAN
  if (CODE_THEN_DIGITS.test(working)) return "sensitive";

  // 4. A 4–6 digit number that looks like a code.
  for (const m of working.matchAll(/(?<!\d)\d{4,6}(?!\d)/g)) {
    const value = m[0];
    const index = m.index ?? 0;
    if (isAmount(working, index, value.length) || isYear(working, index, value)) continue;
    const mostlyTheNumber = otherWordCount(working, value) <= 2;
    if (ctx.stage >= 5 && mostlyTheNumber) return "sensitive"; // (a) after the fake SMS appeared
    const nearby = working.slice(Math.max(0, index - 25), index + value.length + 25);
    if (CODE_NEARBY.test(nearby)) return "sensitive"; // (b) next to a code word, any stage
  }

  return "ok";
}
