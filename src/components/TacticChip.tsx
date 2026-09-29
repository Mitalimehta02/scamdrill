import { TACTIC_INFO, type Tactic } from "../drill/tactics";

/** Amber red-flag chip under a scammer bubble: tactic name + fixed one-line explanation. */
export function TacticChip({ tactic }: { tactic: Tactic }) {
  return (
    <div className="chip">
      <div className="chip-name">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M2 1v12M2 1.5h8l-2 3 2 3H2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        {tactic}
      </div>
      <div className="chip-text">{TACTIC_INFO[tactic].explanation}</div>
    </div>
  );
}
