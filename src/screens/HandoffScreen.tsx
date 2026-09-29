// prd.md > Handoff — reassure the parent that nobody real is calling, then one big button.

import { Badge } from "../components/Badge";
import type { FamilySetup } from "../drill/setup";
import { useT } from "../i18n/useT";

export function HandoffScreen({ setup, onStart }: { setup: FamilySetup; onStart: () => void }) {
  const t = useT().handoff;
  return (
    <div className="screen handoff">
      <div className="badge-lg">
        <Badge size={72} tone="dark" />
      </div>
      <h1>{t.greeting(setup.parentName.trim())}</h1>
      <p>{t.setBy(setup.childName.trim())}</p>
      <div className="reassure">
        <strong>{t.reassureStrong}</strong> {t.reassureRest}
      </div>
      <div style={{ height: 16 }} />
      <button type="button" className="btn btn-primary" onClick={onStart}>
        {t.start}
      </button>
    </div>
  );
}
