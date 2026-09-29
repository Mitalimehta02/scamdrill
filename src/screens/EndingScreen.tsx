// prd.md > Parent Ending Screen — the parent is holding the phone at the moment it ends,
// so they learn first. Kind and teaching, never shaming: no "failed", no red failure style.

import { TacticChip } from "../components/TacticChip";
import { fill } from "../drill/placeholders";
import type { DrillReport } from "../drill/report";
import { safeContactLabel, type FamilySetup } from "../drill/setup";
import { HELPLINE, REPORT_SITE } from "../i18n/strings";
import { useT } from "../i18n/useT";

function RealLife() {
  const t = useT().ending;
  return (
    <div className="real-life">
      <div className="real-life-title">{t.realLifeTitle}</div>
      {t.realLife.before} <strong className="helpline">{HELPLINE}</strong> ({t.realLife.helplineName}) {t.realLife.middle}{" "}
      <strong>{REPORT_SITE}</strong>
      {t.realLife.after}
    </div>
  );
}

export function EndingScreen({
  report,
  setup,
  onHandBack,
}: {
  report: DrillReport;
  setup: FamilySetup;
  onHandBack: () => void;
}) {
  const t = useT().ending;
  const { ending, slip } = report;
  const child = setup.childName.trim();

  return (
    <div className={`screen ending ending-${ending.type}`}>
      {ending.type === "win" && (
        <>
          <div className="ending-icon win" aria-hidden="true">✓</div>
          <h1>
            {ending.reason === "call" ? t.winCall(safeContactLabel(setup)) : t.winHangup} {t.right}
          </h1>
          <ul className="facts">
            {t.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}

      {ending.type === "loss" && (
        <>
          <h1>{t.lossTitle}</h1>
          <p className="ending-lede">{t.lossLede}</p>
          {slip && (
            <div className="moment">
              <div className="bubble">{fill(slip.text, setup)}</div>
              <TacticChip tactic={slip.shownTactic} />
            </div>
          )}
          {ending.reason === "sensitive" && <p className="gentle">{t.sensitive}</p>}
        </>
      )}

      {ending.type === "partial" && (
        <>
          <div className="ending-icon partial" aria-hidden="true">!</div>
          <h1>{t.partialTitle}</h1>
          <p className="ending-lede">{t.partialLede(report.scammerMessages)}</p>
        </>
      )}

      <RealLife />
      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onHandBack}>
        {t.handBack(child || t.family)}
      </button>
    </div>
  );
}
