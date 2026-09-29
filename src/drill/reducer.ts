// The drill state machine: the app — not the AI — decides stage, pressure and endings.
// Pure: no network, no timers, so every rule is unit-testable (spec.md > Drill Engine).

import { STAGE_COUNT } from "./script";
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
  consecutiveAiFailures: number;
  offlineMode: boolean;
  startedAt: number;
  endedAt?: number;
  ending?: Ending;
}

export type DrillAction =
  | { type: "START"; now: number; fakeOtp: string }
  | { type: "SCAMMER_MESSAGE"; id: number; text: string; aiFailed: boolean; now: number; nudge?: boolean }
  | { type: "TAG"; id: number; tactic: Tactic; source: "ai" | "planned" }
  | { type: "PARENT_REPLY"; id: number; text: string; now: number }
  | { type: "EXIT"; reason: "hangup" | "call"; now: number };

export const OFFLINE_AFTER_FAILURES = 3;

export function initialDrill(now = 0, fakeOtp = "000000"): DrillState {
  return {
    stage: 1,
    messages: [],
    pressure: 0,
    awaiting: "scammer",
    fakeOtp,
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
      return {
        ...state,
        messages,
        stage: state.stage + 1, // each reply advances exactly one stage
        awaiting: "scammer",
      };
    }

    case "EXIT":
      return {
        ...state,
        ending: { type: "win", reason: action.reason },
        endedAt: action.now,
      };
  }
}

/** What the server is allowed to see: roles and placeholder text only. */
export function apiHistory(messages: Msg[]): { role: Msg["role"]; text: string }[] {
  return messages.map(({ role, text }) => ({ role, text }));
}
