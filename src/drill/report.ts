// Everything the ending screen and the report card show, worked out from the drill state.
// Pure, so the rules are unit-tested (prd.md > Parent Ending Screen, prd.md > Report Card (Child)).

import { lastScammerLine, type DrillState, type Ending, type Msg } from "./reducer";
import { STAGES } from "./script";
import { TACTICS, TACTIC_INFO, type Tactic } from "./tactics";

export const ENDING_LABELS: Record<Ending["reason"], string> = {
  hangup: "Hung up",
  call: "Called their safe contact",
  otp: "Shared the OTP",
  sensitive: "Tried to share a code or personal number",
  pay: "Sent money",
  stayed: "Stayed on the line too long",
};

/** Used only when no tactic was faced at all (e.g. hung up before the first line arrived). */
export const ENDING_TIPS: Record<Ending["type"], string> = {
  win: "Keep practising together: the reflex to hang up gets faster every time.",
  loss: "Run the drill again soon. Recognising the moment is a skill that grows with practice.",
  partial: "Practise hanging up at the very first threat. You never owe a caller your time.",
};

export const WIN_FACTS = [
  "Real police or CBI never arrest anyone over a call.",
  "\"Digital arrest\" doesn't exist in Indian law.",
  "No official ever asks for your OTP.",
];

export const REAL_LIFE_STEPS = {
  helpline: "1930",
  helplineName: "National Cyber Crime Helpline",
  site: "cybercrime.gov.in",
};

export interface DrillReport {
  ending: Ending;
  durationMs: number;
  /** Things the scammer actually said (the Pay card doesn't count). */
  scammerMessages: number;
  instantReflex: boolean;
  faced: Tactic[];
  notReached: Tactic[];
  /** The scammer line the parent gave in to (losses only). */
  slip?: Msg & { shownTactic: Tactic };
  tip: string;
}

function tacticOf(m: Msg): Tactic {
  return m.tactic ?? STAGES[m.stage]?.plannedTactic ?? "AUTHORITY";
}

export function buildReport(drill: DrillState): DrillReport | null {
  const ending = drill.ending;
  if (!ending) return null;

  const lines = drill.messages.filter((m) => m.role === "scammer" && m.kind !== "pay");
  const faced = TACTICS.filter((t) => lines.some((m) => m.tactic === t));
  const notReached = TACTICS.filter((t) => !faced.includes(t));

  let slip: DrillReport["slip"];
  if (ending.type === "loss") {
    const m = drill.messages.find((x) => x.id === drill.slipMessageId) ?? lastScammerLine(drill.messages);
    if (m) slip = { ...m, shownTactic: tacticOf(m) };
  }

  // The tip: for a loss, the tactic that was active at the slip.
  // Otherwise, the highest-pressure tactic they faced (the one most worth rehearsing again).
  let tip = ENDING_TIPS[ending.type];
  if (slip) tip = TACTIC_INFO[slip.shownTactic].tip;
  else if (faced.length) {
    const hardest = [...faced].sort((a, b) => TACTIC_INFO[b].points - TACTIC_INFO[a].points)[0];
    tip = TACTIC_INFO[hardest].tip;
  }

  return {
    ending,
    durationMs: (drill.endedAt ?? drill.startedAt) - drill.startedAt,
    scammerMessages: lines.length,
    instantReflex: ending.type === "win" && lines.length <= 1,
    faced,
    notReached,
    slip,
    tip,
  };
}
