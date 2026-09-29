// Everything the ending screen and the report card show, worked out from the drill state.
// Pure and language-free, so the rules are unit-tested (prd.md > Parent Ending Screen, prd.md > Report Card (Child)).
// The words themselves come from src/i18n/strings.ts.

import { lastScammerLine, type DrillState, type Ending, type Msg } from "./reducer";
import { STAGES } from "./script";
import { TACTICS, TACTIC_INFO, type Tactic } from "./tactics";

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
  /** Whose tip to show. Undefined → the ending's fallback tip (e.g. hung up before any line arrived). */
  tipTactic?: Tactic;
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
  let tipTactic: Tactic | undefined;
  if (slip) tipTactic = slip.shownTactic;
  else if (faced.length) tipTactic = [...faced].sort((a, b) => TACTIC_INFO[b].points - TACTIC_INFO[a].points)[0];

  return {
    ending,
    durationMs: (drill.endedAt ?? drill.startedAt) - drill.startedAt,
    scammerMessages: lines.length,
    instantReflex: ending.type === "win" && lines.length <= 1,
    faced,
    notReached,
    slip,
    tipTactic,
  };
}
