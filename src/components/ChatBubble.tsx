import { formatClock } from "../drill/format";
import { useT } from "../i18n/useT";
import type { Tactic } from "../drill/tactics";
import { TacticChip } from "./TacticChip";

export function ChatBubble({
  role,
  text,
  at,
  tactic,
  chipCollapsed = false,
}: {
  role: "scammer" | "parent";
  text: string;
  at: number;
  tactic?: Tactic;
  chipCollapsed?: boolean;
}) {
  // When the chip arrives, the bubble it belongs to glows amber briefly — the "reveal" moment.
  const flagged = role === "scammer" && !!tactic;
  const locale = useT().locale;
  return (
    <div className={`msg ${role}`}>
      <div className={`bubble${flagged ? " flagged" : ""}`}>
        {text}
        <span className="time">{formatClock(at, locale)}</span>
      </div>
      {flagged && <TacticChip tactic={tactic} collapsed={chipCollapsed} />}
    </div>
  );
}
