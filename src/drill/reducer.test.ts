import { describe, expect, it } from "vitest";
import { drillReducer, initialDrill, type DrillAction, type DrillState } from "./reducer";
import { STAGE_COUNT } from "./script";
import { TACTICS } from "./tactics";

const run = (actions: DrillAction[], from: DrillState = initialDrill(0, "482913")) => actions.reduce(drillReducer, from);

describe("pressure meter", () => {
  it("only rises, by fixed points per tactic, and never exceeds 100", () => {
    let state = initialDrill();
    let previous = 0;
    let id = 1;
    for (const tactic of [...TACTICS, ...TACTICS]) {
      state = run([
        { type: "SCAMMER_MESSAGE", id, text: "x", aiFailed: false, now: 0 },
        { type: "TAG", id, tactic, source: "ai" },
        { type: "PARENT_REPLY", id: id + 1000, text: "ok", now: 0 },
      ], state);
      if (state.ending) break;
      expect(state.pressure).toBeGreaterThanOrEqual(previous);
      expect(state.pressure).toBeLessThanOrEqual(100);
      previous = state.pressure;
      id++;
    }
  });

  it("adds the same amount for the same tactic", () => {
    const a = run([{ type: "SCAMMER_MESSAGE", id: 1, text: "x", aiFailed: false, now: 0 }, { type: "TAG", id: 1, tactic: "URGENCY", source: "ai" }]);
    expect(a.pressure).toBe(15);
  });

  it("counts each message once, even if tagged twice", () => {
    const s = run([
      { type: "SCAMMER_MESSAGE", id: 1, text: "x", aiFailed: false, now: 0 },
      { type: "TAG", id: 1, tactic: "OTP", source: "ai" },
      { type: "TAG", id: 1, tactic: "PAYMENT", source: "planned" },
    ]);
    expect(s.pressure).toBe(20);
    expect(s.messages[0].tactic).toBe("OTP");
  });
});

describe("turns and stages", () => {
  it("advances exactly one stage per reply, and only on the parent's turn", () => {
    const s = run([
      { type: "PARENT_REPLY", id: 9, text: "too early", now: 0 }, // ignored: scammer's turn
      { type: "SCAMMER_MESSAGE", id: 1, text: "x", aiFailed: false, now: 0 },
      { type: "PARENT_REPLY", id: 2, text: "who is this?", now: 0 },
    ]);
    expect(s.stage).toBe(2);
    expect(s.messages.map((m) => m.role)).toEqual(["scammer", "parent"]);
    expect(s.awaiting).toBe("scammer");
  });

  it("ends as partial after the last stage instead of running past it", () => {
    let s = initialDrill();
    for (let i = 1; i <= STAGE_COUNT; i++) {
      s = run([{ type: "SCAMMER_MESSAGE", id: i, text: "x", aiFailed: false, now: 0 }, { type: "PARENT_REPLY", id: 100 + i, text: "hmm", now: 5 }], s);
    }
    expect(s.ending).toEqual({ type: "partial", reason: "stayed" });
    expect(s.stage).toBe(STAGE_COUNT);
  });

  it("Hang up and Call are wins, and nothing changes afterwards", () => {
    const s = run([
      { type: "SCAMMER_MESSAGE", id: 1, text: "x", aiFailed: false, now: 0 },
      { type: "EXIT", reason: "call", now: 7 },
      { type: "TAG", id: 1, tactic: "AUTHORITY", source: "ai" },
    ]);
    expect(s.ending).toEqual({ type: "win", reason: "call" });
    expect(s.pressure).toBe(0);
  });
});

describe("offline practice mode", () => {
  it("turns on after 3 AI failures in a row, and stays on", () => {
    const fail = (id: number): DrillAction[] => [
      { type: "SCAMMER_MESSAGE", id, text: "canned", aiFailed: true, now: 0 },
      { type: "PARENT_REPLY", id: id + 100, text: "?", now: 0 },
    ];
    expect(run([...fail(1), ...fail(2)]).offlineMode).toBe(false);
    const s = run([...fail(1), ...fail(2), ...fail(3), { type: "SCAMMER_MESSAGE", id: 4, text: "ai", aiFailed: false, now: 0 }]);
    expect(s.offlineMode).toBe(true);
    expect(s.consecutiveAiFailures).toBe(0);
  });
});
