import { describe, expect, it } from "vitest";
import { checkScammerOutput, parseTactic, tidyLine } from "./llm";
import { STAGES } from "../src/drill/script";

describe("checkScammerOutput", () => {
  it("accepts a payment line that uses placeholders", () => {
    expect(checkScammerOutput("Transfer {AMOUNT} to {ACCOUNT} now.").ok).toBe(true);
  });

  it("rejects a payment line with a written amount and account number", () => {
    expect(checkScammerOutput("Transfer ₹2,50,000 to 004277813309").ok).toBe(false);
  });

  it("rejects digit runs split by spaces or dashes", () => {
    expect(checkScammerOutput("Read me the code 482 913 now.").ok).toBe(false);
    expect(checkScammerOutput("Call 98765-43210 immediately.").ok).toBe(false);
  });

  it("allows short numbers like 'within 30 minutes'", () => {
    expect(checkScammerOutput("You have 30 minutes, {PARENT} ji.").ok).toBe(true);
  });

  it("rejects refusals, links, empty and overlong lines", () => {
    expect(checkScammerOutput("I'm sorry, but I can't help with that.").ok).toBe(false);
    expect(checkScammerOutput("Visit www.cbi-verify.com to confirm.").ok).toBe(false);
    expect(checkScammerOutput("   ").ok).toBe(false);
    expect(checkScammerOutput("word ".repeat(81)).ok).toBe(false);
  });

  it("rejects misspelled placeholders (seen live: {GRUNDCHILD})", () => {
    expect(checkScammerOutput("Protect your grandchild {GRUNDCHILD} now.").ok).toBe(false);
    expect(checkScammerOutput("Protect your grandchild {GRANDCHILD} now.").ok).toBe(true);
  });

  it("accepts every canned line (they must never trip our own check)", () => {
    for (const stage of Object.values(STAGES)) {
      expect(checkScammerOutput(stage.cannedLine)).toEqual({ ok: true });
    }
  });
});

describe("parseTactic", () => {
  it("reads a valid tactic, case-insensitively", () => {
    expect(parseTactic('{"tactic": "URGENCY"}')).toBe("URGENCY");
    expect(parseTactic('Sure: {"tactic":"otp"}')).toBe("OTP");
  });

  it("returns null for anything outside the tactic list or not JSON", () => {
    expect(parseTactic('{"tactic": "GUILT"}')).toBeNull();
    expect(parseTactic("URGENCY")).toBeNull();
    expect(parseTactic("{not json}")).toBeNull();
  });
});

describe("tidyLine", () => {
  it("strips a speaker label and wrapping quotes", () => {
    expect(tidyLine('Inspector Sharma: "Stay on the line."')).toBe("Stay on the line.");
  });
});
