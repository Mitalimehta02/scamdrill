import { describe, expect, it } from "vitest";
import { STAGES, NUDGE_LINE } from "../drill/script";
import { TACTICS } from "../drill/tactics";
import { LANGS, STRINGS, type Lang } from "./strings";

/** Every leaf key path of an object, with functions counted as leaves. */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

const langs = LANGS.map((l) => l.id);

describe("strings dictionary", () => {
  it("every language has exactly the same keys as English", () => {
    const en = keyPaths(STRINGS.en).sort();
    for (const lang of langs) expect(keyPaths(STRINGS[lang]).sort()).toEqual(en);
  });

  it("no string is empty, in any language", () => {
    for (const lang of langs) {
      const walk = (v: unknown): void => {
        if (typeof v === "string") expect(v.trim().length).toBeGreaterThan(0);
        else if (typeof v === "function") expect(String(v(`X`)).trim().length).toBeGreaterThan(0);
        else if (v && typeof v === "object") Object.values(v).forEach(walk);
      };
      walk(STRINGS[lang]);
    }
  });

  it("the safety text exists in every language: 3 facts, a helpline name, and a tip + explanation per tactic", () => {
    for (const lang of langs) {
      const t = STRINGS[lang];
      expect(t.ending.facts).toHaveLength(3);
      expect(t.ending.realLife.helplineName.length).toBeGreaterThan(5);
      for (const tactic of TACTICS) {
        expect(t.tactics[tactic].explanation.length).toBeGreaterThan(10);
        expect(t.tactics[tactic].tip.length).toBeGreaterThan(10);
      }
    }
  });

  it("Hindi is really Devanagari, and Hinglish is really Roman script", () => {
    const devanagari = /[\u0900-\u097F]/;
    expect(STRINGS.hi.ending.facts.every((f) => devanagari.test(f))).toBe(true);
    expect(STRINGS.hinglish.ending.facts.some((f) => devanagari.test(f))).toBe(false);
    for (let s = 1; s <= 10; s++) {
      expect(STAGES[s].cannedLine.hi).toMatch(devanagari);
      expect(STAGES[s].cannedLine.hinglish).not.toMatch(devanagari);
    }
  });

  it("every canned line keeps its placeholders in Latin letters in every language", () => {
    const placeholders = (text: string) => (text.match(/\{[A-Z_]+\}/g) ?? []).sort();
    for (let s = 1; s <= 10; s++) {
      const expected = placeholders(STAGES[s].cannedLine.en);
      for (const lang of ["hi", "hinglish"] as Lang[]) expect(placeholders(STAGES[s].cannedLine[lang])).toEqual(expected);
    }
    for (const lang of langs) expect(NUDGE_LINE[lang]).toContain("{PARENT}");
  });
});
