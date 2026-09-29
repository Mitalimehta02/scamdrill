import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CLASSIFY_TIMEOUT_MS, classify, getScammerLine } from "./api";
import { toPlaceholders } from "./placeholders";
import { apiHistory, drillReducer, initialDrill } from "./reducer";
import { STAGES } from "./script";
import { DEMO_SETUP } from "./setup";

let bodies: string[] = [];

beforeEach(() => {
  bodies = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      bodies.push(`${url} ${init.body}`);
      const payload = url.includes("classify") ? { tactic: "URGENCY" } : { text: "Namaste {PARENT} ji, stay on the line." };
      return new Response(JSON.stringify(payload), { status: 200 });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("privacy: no real setup value reaches /api/*", () => {
  it("holds across a drill where the parent types every family detail", async () => {
    // Replies that mention every setup value, in mixed case — the worst case for leakage.
    const replies = [
      "I am Kamala, who is this?",
      "My account is at sbi, not anything else",
      "Please don't involve AARAV",
      "Let me call Rahul first, he is my son",
      "Anjali set this up for me",
    ];
    let state = initialDrill(0, "482913");
    let id = 1;
    for (let stage = 1; stage <= replies.length; stage++) {
      const line = await getScammerLine(stage, apiHistory(state.messages), { demo: false });
      state = drillReducer(state, { type: "SCAMMER_MESSAGE", id: id++, text: line.text, aiFailed: line.aiFailed, now: 0 });
      await classify(line.text, STAGES[stage].plannedTactic, { demo: false });
      state = drillReducer(state, { type: "PARENT_REPLY", id: id++, text: toPlaceholders(replies[stage - 1], DEMO_SETUP), now: 0 });
    }
    await getScammerLine(state.stage, apiHistory(state.messages), { demo: false });

    expect(bodies.length).toBeGreaterThan(5);
    const everything = bodies.join("\n").toLowerCase();
    for (const value of ["Kamala", "SBI", "Aarav", "Rahul", "Anjali"]) {
      expect(everything).not.toContain(value.toLowerCase());
    }
    // ...while the placeholders did go through, so the AI can still personalise.
    expect(everything).toContain("{parent}");
  }, 15000); // each live-mode line waits the 900 ms minimum typing time
});

describe("fallbacks", () => {
  it("demo mode never calls the server", async () => {
    vi.useFakeTimers();
    const line = getScammerLine(1, [], { demo: true });
    await vi.advanceTimersByTimeAsync(2000);
    expect((await line).text).toBe(STAGES[1].cannedLine.en);
    const tag = classify("x", "AUTHORITY", { demo: true });
    await vi.advanceTimersByTimeAsync(500);
    expect(await tag).toEqual({ tactic: "AUTHORITY", source: "planned" });
    expect(bodies).toHaveLength(0);
  });

  it("uses the canned line when the server says fallback", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ fallback: true }), { status: 200 })));
    const line = await getScammerLine(3, [], { demo: false });
    expect(line).toEqual({ text: STAGES[3].cannedLine.en, aiFailed: true });
  });

  it("shows the planned tactic when the classifier takes longer than 3 seconds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => init.signal?.addEventListener("abort", () => reject(new Error("aborted")))),
      ),
    );
    const tag = classify("Read me the code now", "OTP", { demo: false });
    await vi.advanceTimersByTimeAsync(CLASSIFY_TIMEOUT_MS + 1);
    expect(await tag).toEqual({ tactic: "OTP", source: "planned" });
  });

  it("uses the chosen language: Hindi canned lines, and the language is sent to the server", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        bodies.push(`${url} ${init.body}`);
        return new Response(JSON.stringify({ fallback: true }), { status: 200 });
      }),
    );
    const line = await getScammerLine(5, [], { demo: false, language: "hi" });
    expect(line.text).toBe(STAGES[5].cannedLine.hi);
    expect(JSON.parse(bodies[0].split(" ").slice(1).join(" ")).language).toBe("hi");
  });

  it("rejects a tactic outside the list", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ tactic: "GUILT" }), { status: 200 })));
    expect(await classify("x", "FEAR", { demo: false })).toEqual({ tactic: "FEAR", source: "planned" });
  });
});
