// The drill state machine: the app — not the AI — decides stage, pressure and endings.
// Pure: no network, no timers, so every rule is unit-testable (spec.md > Drill Engine).

import { STAGE_COUNT, STAGES } from "./script";
import { TACTIC_INFO, METER_CAP, type Tactic } from "./tactics";

export interface Msg {
  id: number;
  role: "scammer" | "parent";
  /** Placeholder form ({PARENT}, {BANK}, ...). Filled in only when displayed. */
  text: string;
  stage: number;
  /** When it appeared, for the chat timestamp. */
  at: number;
  tactic?: Tactic;
  tacticSource?: "ai" | "planned";
  nudge?: boolean;
  /** The fake "Transfer to RBI safe account" card (stage 7). Not dialogue: never sent to the AI or tagged. */
  kind?: "pay";
}

export type EndReason = "hangup" | "call" | "otp" | "sensitive" | "pay" | "stayed";

export interface Ending {
  type: "win" | "loss" | "partial";
  reason: EndReason;
}

export interface DrillState {
  stage: number;
  messages: Msg[];
  pressure: number;
  /** Whose turn it is. The scammer line for `stage` is requested while this is "scammer". */
  awaiting: "scammer" | "parent";
  fakeOtp: string;
  /** The fake OTP SMS has appeared (stage 5 onwards). */
  otpVisible: boolean;
  /** At most one silence nudge per stage. */
  nudgedThisStage: boolean;
  /** The next scammer line should be a nudge, not the stage beat. */
  pendingNudge: boolean;
  consecutiveAiFailures: number;
  offlineMode: boolean;
  startedAt: number;
  endedAt?: number;
  ending?: Ending;
  /** The scammer message the parent gave in to (shown on the loss screen). */
  slipMessageId?: number;
}

export type DrillAction =
  | { type: "START"; now: number; fakeOtp: string }
  | { type: "SCAMMER_MESSAGE"; id: number; text: string; aiFailed: boolean; now: number; nudge?: boolean }
  | { type: "TAG"; id: number; tactic: Tactic; source: "ai" | "planned" }
  | { type: "PARENT_REPLY"; id: number; text: string; now: number }
  | { type: "EXIT"; reason: "hangup" | "call" | "pay"; now: number; id?: number }
  | { type: "NUDGE_DUE" }
  | { type: "GUARD_LOSS"; kind: "otp" | "sensitive"; now: number };

export const OFFLINE_AFTER_FAILURES = 3;

export function initialDrill(now = 0, fakeOtp = "000000"): DrillState {
  return {
    stage: 1,
    messages: [],
    pressure: 0,
    awaiting: "scammer",
    fakeOtp,
    otpVisible: false,
    nudgedThisStage: false,
    pendingNudge: false,
    consecutiveAiFailures: 0,
    offlineMode: false,
    startedAt: now,
  };
}

export function drillReducer(state: DrillState, action: DrillAction): DrillState {
  if (action.type === "START") return initialDrill(action.now, action.fakeOtp);
  if (state.ending) return state; // nothing changes once the drill has ended

  switch (action.type) {
    case "SCAMMER_MESSAGE": {
      const failures = action.aiFailed ? state.consecutiveAiFailures + 1 : 0;
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: action.id, role: "scammer", text: action.text, stage: state.stage, at: action.now, nudge: action.nudge },
        ],
        awaiting: "parent",
        pendingNudge: false,
        consecutiveAiFailures: failures,
        // Sticky: once offline, stay offline for this drill so the note doesn't flicker.
        offlineMode: state.offlineMode || failures >= OFFLINE_AFTER_FAILURES,
      };
    }

    case "TAG": {
      const target = state.messages.find((m) => m.id === action.id);
      if (!target || target.tactic) return state; // tag each message once, so the meter can't double-count
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, tactic: action.tactic, tacticSource: action.source } : m,
        ),
        // The meter only rises, by fixed points per tactic, capped at 100. It never reads the parent's replies.
        pressure: Math.min(METER_CAP, state.pressure + TACTIC_INFO[action.tactic].points),
      };
    }

    case "PARENT_REPLY": {
      if (state.awaiting !== "parent") return state;
      const messages = [...state.messages, { id: action.id, role: "parent" as const, text: action.text, stage: state.stage, at: action.now }];
      // Replying after the last stage means they stayed on the line to the end (full handling in slice 3).
      if (state.stage >= STAGE_COUNT) {
        return { ...state, messages, ending: { type: "partial", reason: "stayed" }, endedAt: action.now };
      }
      const stage = state.stage + 1; // each reply advances exactly one stage
      const event = STAGES[stage].event;
      // The fake SMS and the Pay card appear as soon as their stage begins, not on a timer.
      const payCard: Msg[] = event === "pay" ? [{ id: -stage, role: "scammer", kind: "pay", text: "", stage, at: action.now }] : [];
      return {
        ...state,
        messages: [...messages, ...payCard],
        stage,
        awaiting: "scammer",
        otpVisible: state.otpVisible || event === "otp",
        nudgedThisStage: false,
      };
    }

    case "NUDGE_DUE":
      if (state.awaiting !== "parent" || state.nudgedThisStage) return state;
      return { ...state, awaiting: "scammer", pendingNudge: true, nudgedThisStage: true };

    case "GUARD_LOSS":
      return {
        ...state,
        ending: { type: "loss", reason: action.kind },
        endedAt: action.now,
        slipMessageId: lastScammerLine(state.messages)?.id,
      };

    case "EXIT":
      if (action.reason === "pay") {
        return {
          ...state,
          ending: { type: "loss", reason: "pay" },
          endedAt: action.now,
          slipMessageId: lastScammerLine(state.messages)?.id,
        };
      }
      return { ...state, ending: { type: "win", reason: action.reason }, endedAt: action.now };
  }
}

/** The last thing the scammer actually said (the Pay card doesn't count). */
export function lastScammerLine(messages: Msg[]): Msg | undefined {
  return [...messages].reverse().find((m) => m.role === "scammer" && m.kind !== "pay");
}

/** What the server is allowed to see: roles and placeholder text only. */
export function apiHistory(messages: Msg[]): { role: Msg["role"]; text: string }[] {
  return messages.filter((m) => m.kind !== "pay").map(({ role, text }) => ({ role, text }));
}
