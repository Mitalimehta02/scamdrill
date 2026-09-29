// The safety guard (prd.md > Safety Guard, spec.md > Safety Guard).
// Runs in the browser on every reply BEFORE anything is stored or sent.
// A match ends the drill as a loss, and the text never leaves the browser.

export type GuardVerdict = "otp" | "sensitive" | "ok";

const CODE_WORDS = /\b(pin|cvv|otp|code|password|passcode)\b/i;

/** Joins digit groups split by spaces or dashes: "1234 5678 9012" → "123456789012". */
function joinDigits(text: string): string {
  return text.replace(/(?<=\d)[\s-]+(?=\d)/g, "");
}

/** Indian mobile numbers are never blocked: "+91 98765 43210", "98765-43210", "9876543210". */
function removePhoneNumbers(text: string): string {
  return text.replace(/(?:\+\s?91[\s-]*)?(?<![\d])[6-9]\d{4}[\s-]?\d{5}(?!\d)/g, " ");
}

/** "₹5000", "Rs. 5,000", "5000 rupees", "5000/-" — amounts, not codes. */
function isAmount(text: string, index: number, length: number): boolean {
  const before = text.slice(Math.max(0, index - 8), index);
  const after = text.slice(index + length, index + length + 10);
  return /(₹|\brs\.?|\binr)\s*$/i.test(before) || /^\s*(rupees?|rs\b|\/-)/i.test(after);
}

/** 1900–2099 next to "born", "year" or "since" — a year, not a code. */
function isYear(text: string, index: number, value: string): boolean {
  const n = Number(value);
  if (value.length !== 4 || n < 1900 || n > 2099) return false;
  const around = text.slice(Math.max(0, index - 20), index + 24);
  return /\b(born|year|years|since)\b/i.test(around);
}

/** Letter-containing words other than the number itself. */
function otherWordCount(text: string, number: string): number {
  return text
    .replace(number, " ")
    .split(/\s+/)
    .filter((w) => /\p{L}/u.test(w)).length;
}

export function checkReply(text: string, ctx: { fakeOtp: string; stage: number }): GuardVerdict {
  const joined = joinDigits(text);

  // 1. The exact fake OTP (spaces or dashes ignored) → "Shared the OTP".
  if (new RegExp(`(?<!\\d)${ctx.fakeOtp}(?!\\d)`).test(joined)) return "otp";

  // 2. Take phone numbers out first: "+91 98765 43210" has 12 digits, the same as an Aadhaar number.
  const working = joinDigits(removePhoneNumbers(text));

  // 3. Always sensitive, at any stage.
  if (/(?<!\d)\d{12,19}(?!\d)/.test(working)) return "sensitive"; // Aadhaar (12) or card (13–19)
  if (/\b[A-Z]{5}\d{4}[A-Z]\b/i.test(working)) return "sensitive"; // PAN
  if (/\b(pin|cvv|otp|code|password|passcode)\b\W*(?:\p{L}+\W+){0,3}\d{3,}/iu.test(working)) return "sensitive";

  // 4. A 4–6 digit number that looks like a code.
  for (const m of working.matchAll(/(?<!\d)\d{4,6}(?!\d)/g)) {
    const value = m[0];
    const index = m.index ?? 0;
    if (isAmount(working, index, value.length) || isYear(working, index, value)) continue;
    const mostlyTheNumber = otherWordCount(working, value) <= 2;
    if (ctx.stage >= 5 && mostlyTheNumber) return "sensitive"; // (a) after the fake SMS appeared
    const nearby = working.slice(Math.max(0, index - 25), index + value.length + 25);
    if (CODE_WORDS.test(nearby)) return "sensitive"; // (b) next to a code word, any stage
  }

  return "ok";
}
