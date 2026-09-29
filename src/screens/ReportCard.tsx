// prd.md > Report Card (Child) — what the child wants to know, and one thing to practise next.

import { Badge } from "../components/Badge";
import { formatDuration } from "../drill/format";
import { fill } from "../drill/placeholders";
import type { DrillReport } from "../drill/report";
import { safeContactLabel, type FamilySetup } from "../drill/setup";
import { TACTICS } from "../drill/tactics";
import { useT } from "../i18n/useT";

export function ReportCard({ report, setup, onAgain }: { report: DrillReport; setup: FamilySetup; onAgain: () => void }) {
  const all = useT();
  const t = all.report;
  const { ending } = report;
  const parent = setup.parentName.trim();
  const label = ending.reason === "call" ? t.called(safeContactLabel(setup)) : t.labels[ending.reason];
  const headline = report.instantReflex
    ? report.scammerMessages === 0
      ? t.instantZero
      : t.instantOne
    : t.outcome[ending.type];
  const tip = report.tipTactic ? all.tactics[report.tipTactic].tip : t.fallbackTips[ending.type];

  return (
    <div className="screen report">
      <div className="wordmark">
        <Badge size={30} tone="dark" />
        {t.title}
      </div>
      <p className="lede report-for">{t.forParent(parent)}</p>

      <div className={`outcome outcome-${ending.type}`}>
        <div className="outcome-title">{headline}</div>
        <div className="outcome-label">{label}</div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">{formatDuration(report.durationMs)}</div>
          <div className="stat-label">{t.onLine}</div>
        </div>
        <div className="stat">
          <div className="stat-value">{report.scammerMessages}</div>
          <div className="stat-label">{t.scammerMessages}</div>
        </div>
      </div>

      <h2 className="section-title">{t.tactics}</h2>
      <ul className="tactic-list">
        {TACTICS.map((id) => {
          const faced = report.faced.includes(id);
          return (
            <li key={id} className={faced ? "faced" : "not-reached"}>
              <span className="tick" aria-hidden="true">{faced ? "✓" : "–"}</span>
              <span className="tactic-name">{all.tactics[id].name}</span>
            </li>
          );
        })}
      </ul>
      {report.notReached.length > 0 && <p className="note-muted">{t.greyNote}</p>}

      {report.slip && (
        <>
          <h2 className="section-title">{t.moment}</h2>
          <blockquote className="moment-quote">
            "{fill(report.slip.text, setup)}"
            <footer>{all.tactics[report.slip.shownTactic].name}</footer>
          </blockquote>
        </>
      )}

      <div className="tip">
        <div className="tip-title">{t.tipTitle}</div>
        {tip}
      </div>

      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onAgain}>
        {t.again}
      </button>
    </div>
  );
}
