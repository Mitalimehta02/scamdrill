// prd.md > Handoff — reassure the parent that nobody real is calling, then one big button.

import { Badge } from "../components/Badge";
import type { FamilySetup } from "../drill/setup";

export function HandoffScreen({ setup, onStart }: { setup: FamilySetup; onStart: () => void }) {
  return (
    <div className="screen handoff">
      <div className="badge-lg">
        <Badge size={72} tone="dark" />
      </div>
      <h1>Namaste, {setup.parentName.trim()} ji</h1>
      <p>{setup.childName.trim()} has set up a practice drill for you.</p>
      <div className="reassure">
        <strong>This is only practice.</strong> Nobody real is calling. Someone pretending to be an officer will
        message you. Your job is to spot the tricks and <strong>hang up</strong> or <strong>call family</strong>.
      </div>
      <div style={{ height: 16 }} />
      <button type="button" className="btn btn-primary" onClick={onStart}>
        Start practice
      </button>
    </div>
  );
}
