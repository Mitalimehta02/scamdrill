import { describe, expect, it } from "vitest";
import { drillReducer, initialDrill, type DrillAction, type DrillState } from "./reducer";
import { buildReport, ENDING_TIPS } from "./report";
import { TACTIC_INFO, type Tactic } from "./tactics";

const play = (actions: DrillAction[]): DrillState => actions.reduce(drillReducer, initialDrill(1000, "482913"));

/** One scammer line tagged with `tactic`, then (optionally) a parent reply. */
const turn = (id: number, tactic: Tactic, reply = true): DrillAction[] => [
  { type: "SCAMMER_MESSAGE", id, text: `line ${id}`, aiFailed: false, now: 0 },
  { type: "TAG", id, tactic, source: "ai" },
  ...(reply ? [{ type: "PARENT_REPLY" as const, id: id + 100, text: "hmm", now: 0 }] : []),
];

describe("report card", () => {
  it("hanging up after one message is an Instant reflex, with only AUTHORITY faced", () => {
    const r = buildReport(play([...turn(1, "AUTHORITY", false), { type: "EXIT", reason: "hangup", now: 19000 }]))!;
    expect(r.instantReflex).toBe(true);
    expect(r.scammerMessages).toBe(1);
    expect(r.faced).toEqual(["AUTHORITY"]);
    expect(r.notReached).toHaveLength(6);
    expect(r.durationMs).toBe(18000);
    expect(r.tip).toBe(TACTIC_INFO.AUTHORITY.tip);
  });

  it("after a loss, the tip and the moment come from the line they gave in to", () => {
    const r = buildReport(
      play([...turn(1, "AUTHORITY"), ...turn(2, "FEAR"), ...turn(3, "OTP", false), { type: "GUARD_LOSS", kind: "otp", now: 5000 }]),
    )!;
    expect(r.ending).toEqual({ type: "loss", reason: "otp" });
    expect(r.slip?.id).toBe(3);
    expect(r.slip?.shownTactic).toBe("OTP");
    expect(r.tip).toBe(TACTIC_INFO.OTP.tip);
    expect(r.instantReflex).toBe(false);
  });

  it("after a win or partial, the tip is for the highest-pressure tactic faced", () => {
    const r = buildReport(play([...turn(1, "AUTHORITY"), ...turn(2, "SECRECY"), ...turn(3, "FEAR", false), { type: "EXIT", reason: "call", now: 0 }]))!;
    expect(r.tip).toBe(TACTIC_INFO.SECRECY.tip);
    expect(r.instantReflex).toBe(false);
  });

  it("an untagged slip line falls back to its stage's planned tactic", () => {
    const r = buildReport(play([{ type: "SCAMMER_MESSAGE", id: 1, text: "x", aiFailed: false, now: 0 }, { type: "GUARD_LOSS", kind: "sensitive", now: 0 }]))!;
    expect(r.slip?.shownTactic).toBe("AUTHORITY");
  });

  it("hanging up before the first line still produces a sensible report", () => {
    const r = buildReport(play([{ type: "EXIT", reason: "hangup", now: 2000 }]))!;
    expect(r.scammerMessages).toBe(0);
    expect(r.instantReflex).toBe(true);
    expect(r.tip).toBe(ENDING_TIPS.win);
  });

  it("returns null while the drill is still running", () => {
    expect(buildReport(initialDrill())).toBeNull();
  });
});
