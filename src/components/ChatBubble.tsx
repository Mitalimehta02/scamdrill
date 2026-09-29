import { formatClock } from "../drill/format";
import type { Tactic } from "../drill/tactics";
import { TacticChip } from "./TacticChip";

export function ChatBubble({ role, text, at, tactic }: { role: "scammer" | "parent"; text: string; at: number; tactic?: Tactic }) {
  // When the chip arrives, the bubble it belongs to glows amber briefly — the "reveal" moment.
  const flagged = role === "scammer" && !!tactic;
  return (
    <div className={`msg ${role}`}>
      <div className={`bubble${flagged ? " flagged" : ""}`}>
        {text}
        <span className="time">{formatClock(at)}</span>
      </div>
      {flagged && <TacticChip tactic={tactic} />}
    </div>
  );
}
