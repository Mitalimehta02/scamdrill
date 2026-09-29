// Real names live only in the browser. Everything sent to /api/* uses placeholders,
// and they're swapped back only for display (spec.md > Placeholders).

import type { FamilySetup } from "./setup";
import { FAKE_PAYMENT } from "./tactics";

type NameKey = "parentName" | "bank" | "grandchildName" | "safeContactName" | "childName";

const NAME_PLACEHOLDERS: [string, NameKey][] = [
  ["PARENT", "parentName"],
  ["BANK", "bank"],
  ["GRANDCHILD", "grandchildName"],
  ["SAFE_CONTACT", "safeContactName"],
  ["CHILD", "childName"],
];

/** Placeholder text → what the parent sees on screen. Unknown {…} are removed. */
export function fill(text: string, setup: FamilySetup): string {
  const values: Record<string, string> = {
    AMOUNT: FAKE_PAYMENT.amount,
    ACCOUNT: FAKE_PAYMENT.account,
  };
  for (const [ph, key] of NAME_PLACEHOLDERS) values[ph] = setup[key].trim();

  let out = text;
  if (!values.PARENT) out = out.replace(/\{PARENT\}\s+(ji|जी)/g, "Sir/Madam");
  return out
    .replace(/\{([A-Z_]+)\}/g, (_, name: string) => values[name] ?? "")
    .replace(/ {2,}/g, " ")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * What the parent typed → placeholder form, before it is sent anywhere.
 * The parent might type "Is Rahul in trouble?" — "Rahul" must not leave the browser.
 */
export function toPlaceholders(text: string, setup: FamilySetup): string {
  const pairs = NAME_PLACEHOLDERS.map(([ph, key]) => [ph, setup[key].trim()] as const)
    .filter(([, value]) => value.length >= 2)
    .sort((a, b) => b[1].length - a[1].length); // longest first, so "Rahul Kumar" beats "Rahul"

  let out = text;
  for (const [ph, value] of pairs) {
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(value)}(?![\\p{L}\\p{N}])`, "giu");
    out = out.replace(pattern, `{${ph}}`);
  }
  return out;
}
