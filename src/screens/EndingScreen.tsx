// prd.md > Parent Ending Screen — the parent is holding the phone at the moment it ends,
// so they learn first. Kind and teaching, never shaming: no "failed", no red failure style.

import { TacticChip } from "../components/TacticChip";
import { fill } from "../drill/placeholders";
import { REAL_LIFE_STEPS, WIN_FACTS, type DrillReport } from "../drill/report";
import { safeContactLabel, type FamilySetup } from "../drill/setup";

function RealLife() {
  return (
    <div className="real-life">
      <div className="real-life-title">In real life</div>
      Hang up, then call <strong className="helpline">{REAL_LIFE_STEPS.helpline}</strong> ({REAL_LIFE_STEPS.helplineName}) or
      report at <strong>{REAL_LIFE_STEPS.site}</strong>.
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
  const { ending, slip } = report;
  const child = setup.childName.trim();

  return (
    <div className={`screen ending ending-${ending.type}`}>
      {ending.type === "win" && (
        <>
          <div className="ending-icon win" aria-hidden="true">✓</div>
          <h1>
            {ending.reason === "call" ? `You called ${safeContactLabel(setup)}.` : "You hung up."} That's exactly right.
          </h1>
          <ul className="facts">
            {WIN_FACTS.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}

      {ending.type === "loss" && (
        <>
          <h1>This is how it happens to careful people.</h1>
          <p className="ending-lede">Here's the moment:</p>
          {slip && (
            <div className="moment">
              <div className="bubble">{fill(slip.text, setup)}</div>
              <TacticChip tactic={slip.shownTactic} />
            </div>
          )}
          {ending.reason === "sensitive" && (
            <p className="gentle">
              Please never type real details, even in practice. In a real call, this is exactly what they want.
            </p>
          )}
        </>
      )}

      {ending.type === "partial" && (
        <>
          <div className="ending-icon partial" aria-hidden="true">!</div>
          <h1>You didn't give anything away.</h1>
          <p className="ending-lede">
            But you stayed on the line for {report.scammerMessages} messages. Next time, hang up at the first threat.
          </p>
        </>
      )}

      <RealLife />
      <div className="spacer" />
      <button type="button" className="btn btn-primary" onClick={onHandBack}>
        Hand back to {child || "your family"}
      </button>
    </div>
  );
}
