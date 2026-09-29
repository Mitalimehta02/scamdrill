import { describe, expect, it } from "vitest";
import { checkBeat, checkScammerOutput, parseTactic, ruleTactic, tidyLine } from "./llm";
import { NUDGE_LINE, STAGES } from "../src/drill/script";

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

  it("rejects Devanagari digits and Hindi / Hinglish refusals (slice 5)", () => {
    expect(checkScammerOutput("अभी २,५०,००० ट्रांसफ़र कीजिए").ok).toBe(false);
    expect(checkScammerOutput("कोड ४८२९१३ बताइए").ok).toBe(false);
    expect(checkScammerOutput("माफ़ कीजिए, मैं इसमें मदद नहीं कर सकता।").ok).toBe(false);
    expect(checkScammerOutput("Sorry, main isme madad nahi kar sakta.").ok).toBe(false);
    expect(checkScammerOutput("{PARENT} जी, {ACCOUNT} में {AMOUNT} अभी ट्रांसफ़र कीजिए।").ok).toBe(true);
    expect(checkScammerOutput("{PARENT} ji, 30 minute mein jawab dijiye.").ok).toBe(true);
  });

  it("accepts every canned line in every language (they must never trip our own check)", () => {
    for (const stage of Object.values(STAGES)) {
      for (const line of Object.values(stage.cannedLine)) expect(checkScammerOutput(line)).toEqual({ ok: true });
    }
    for (const line of Object.values(NUDGE_LINE)) expect(checkScammerOutput(line)).toEqual({ ok: true });
  });
});

describe("checkBeat (the app sets the pace)", () => {
  it("rejects money talk before the Pay card (seen live in Hinglish)", () => {
    expect(checkBeat("{PARENT} ji, aapke phone par jo {AMOUNT} ka code aaya hai, woh bataiye.", 5).ok).toBe(false);
    expect(checkBeat("{PARENT} ji, {GRANDCHILD} ki khaatir {AMOUNT} transfer kijiye.", 6).ok).toBe(false);
    expect(checkBeat("Transfer {AMOUNT} to {ACCOUNT} now, {PARENT} ji.", 7).ok).toBe(true);
    expect(checkBeat("Every minute counts. Send {AMOUNT} now.", 8).ok).toBe(true);
  });

  it("requires the stage's personal detail: bank at 2, grandchild at 6, amount at 7, safe contact at 9", () => {
    expect(checkBeat("Main {PARENT} ji se baat kar raha hoon.", 2).ok).toBe(false);
    expect(checkBeat("{PARENT} जी, {BANK} के खाते से मनी-लॉन्ड्रिंग हुई है।", 2).ok).toBe(true);
    expect(checkBeat("Your family could be questioned.", 6).ok).toBe(false);
    expect(checkBeat("Don't call anyone.", 9).ok).toBe(false);
    expect(checkBeat("Don't call {SAFE_CONTACT}.", 9).ok).toBe(true);
  });

  it("a silence nudge doesn't need the stage's detail", () => {
    expect(checkBeat("{PARENT} ji, jawab dijiye.", 9, true).ok).toBe(true);
  });

  it("every canned line passes its own stage's beat check, in every language", () => {
    for (const [n, stage] of Object.entries(STAGES)) {
      for (const line of Object.values(stage.cannedLine)) expect(checkBeat(line, Number(n))).toEqual({ ok: true });
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

describe("ruleTactic", () => {
  it("labels any line with the payment placeholders as PAYMENT, without the model", () => {
    expect(ruleTactic("Send {AMOUNT} to {ACCOUNT} or {GRANDCHILD} may be questioned.")).toBe("PAYMENT");
    expect(ruleTactic("Your grandchild {GRANDCHILD} may be questioned.")).toBeNull();
  });
});

describe("tidyLine", () => {
  it("strips a speaker label and wrapping quotes", () => {
    expect(tidyLine('Inspector Sharma: "Stay on the line."')).toBe("Stay on the line.");
  });
});
