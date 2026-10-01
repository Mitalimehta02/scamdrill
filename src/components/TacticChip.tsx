import { useState } from "react";
import type { Tactic } from "../drill/tactics";
import { useT } from "../i18n/useT";

const FlagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M2 1v12M2 1.5h8l-2 3 2 3H2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

/**
 * Amber red-flag chip under a scammer bubble: tactic name + fixed one-line explanation.
 * Older chips collapse to a one-line pill with just the name (tap to expand), so the chat keeps
 * room for two full messages while the newest tactic stays fully explained.
 */
export function TacticChip({ tactic, collapsed = false }: { tactic: Tactic; collapsed?: boolean }) {
  const info = useT().tactics[tactic];
  const [expanded, setExpanded] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        className={`chip chip-button${expanded ? "" : " collapsed"}`}
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      >
        <span className="chip-name">
          <FlagIcon />
          {info.name}
        </span>
        {expanded && <span className="chip-text">{info.explanation}</span>}
      </button>
    );
  }

  return (
    <div className="chip">
      <div className="chip-name">
        <FlagIcon />
        {info.name}
      </div>
      <div className="chip-text">{info.explanation}</div>
    </div>
  );
}
