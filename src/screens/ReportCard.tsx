// prd.md > Report Card (Child) — what the child wants to know, and one thing to practise next.

import { Badge } from "../components/Badge";
import { formatDuration } from "../drill/format";
import { fill } from "../drill/placeholders";
import { ENDING_LABELS, type DrillReport } from "../drill/report";
import { safeContactLabel, type FamilySetup } from "../drill/setup";
import { TACTICS } from "../drill/tactics";

const OUTCOME_TITLE = { win: "Ended the call in time", loss: "Got caught out this time", partial: "Stayed on the line" } as const;

export function ReportCard({ report, setup, onAgain }: { report: DrillReport; setup: FamilySetup; onAgain: () => void }) {
  const { ending } = report;
  const parent = setup.parentName.trim();
  const label = ending.reason === "call" ? `Called ${safeContactLabel(setup)}` : ENDING_LABELS[ending.reason];
  const headline = report.instantReflex
    ? report.scammerMessages === 0
      ? "Instant reflex: ended the call straight away"
      : "Instant reflex: ended the call after 1 message"
    : OUTCOME_TITLE[ending.type];

  return (
    <div className="screen report">
      <div className="wordmark">
        <Badge size={30} tone="dark" />
        Report card
      </div>
      <p className="lede report-for">{parent}'s practice drill</p>

      <div className={`outcome outcome-${ending.type}`}>
        <div className="outcome-title">{headline}</div>
        <div className="outcome-label">{label}</div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">{formatDuration(report.durationMs)}</div>
          <div className="stat-label">on the line</div>
        </div>
        <div className="stat">
          <div className="stat-value">{report.scammerMessages}</div>
          <div className="stat-label">scammer messages</div>
        </div>
      </div>

      <h2 className="section-title">Tactics</h2>
      <ul className="tactic-list">
        {TACTICS.map((t) => {
          const faced = report.faced.includes(t);
          return (
            <li key={t} className={faced ? "faced" : "not-reached"}>
              <span className="tick" aria-hidden="true">{faced ? "✓" : "–"}</span>
              <span className="tactic-name">{t}</span>
              <span className="sr-only">{faced ? "faced" : "not reached"}</span>
            </li>
          );
        })}
      </ul>
      {report.notReached.length > 0 && (
        <p className="note-muted">Greyed out: the scammer never got to use these.</p>
      )}

      {report.slip && (
        <>
          <h2 className="section-title">The moment</h2>
          <blockquote className="moment-quote">
            "{fill(report.slip.text, setup)}"
            <footer>{report.slip.shownTactic}</footer>
          </blockquote>
        </>
      )}

      <div className="tip">
        <div className="tip-title">Practise next time</div>
        {report.tip}
      </div>

      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onAgain}>
        Run another drill
      </button>
    </div>
  );
}
