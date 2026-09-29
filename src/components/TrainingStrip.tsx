import { isDemoOnlyBuild } from "../drill/api";
import { useT } from "../i18n/useT";

/** Visible on every screen, at all times (prd.md > Safety Guard).
 *  The public demo build also says, honestly, that the lines are scripted (prd.md > Resilience and Demo Mode). */
export function TrainingStrip() {
  const t = useT();
  return (
    <>
      <div className="training-strip" role="note">
        {t.strip}
      </div>
      {isDemoOnlyBuild() && <div className="demo-note">{t.demoNote}</div>}
    </>
  );
}
