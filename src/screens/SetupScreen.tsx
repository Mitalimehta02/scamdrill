// prd.md > Family Setup — the child fills this in, then hands the phone over.

import { Badge } from "../components/Badge";
import { DEMO_SETUP, isSetupComplete, type FamilySetup } from "../drill/setup";

type TextKey = Exclude<keyof FamilySetup, "language">;

const FIELDS: { key: TextKey; label: string; placeholder: string; hint?: string }[] = [
  { key: "childName", label: "Your name", placeholder: "e.g. Anjali" },
  { key: "parentName", label: "Parent's name", placeholder: "e.g. Kamala", hint: "what the caller will call them" },
  { key: "bank", label: "Their bank", placeholder: "e.g. SBI, HDFC" },
  { key: "grandchildName", label: "A grandchild's name", placeholder: "e.g. Aarav" },
];

export function SetupScreen({
  setup,
  onChange,
  onHandOff,
}: {
  setup: FamilySetup;
  onChange: (next: FamilySetup) => void;
  onHandOff: () => void;
}) {
  const set = (key: TextKey) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...setup, [key]: e.target.value });
  const ready = isSetupComplete(setup);
  const parent = setup.parentName.trim();

  return (
    <form
      className="screen"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onHandOff();
      }}
    >
      <div className="wordmark">
        <Badge size={34} tone="dark" />
        ScamDrill
      </div>
      <h1>Set up a practice drill</h1>
      <p className="lede">
        Your parent will practise a fake "digital arrest" call on this phone. These details make it feel real.
      </p>

      <button type="button" className="btn btn-secondary" onClick={() => onChange(DEMO_SETUP)}>
        Use demo details
      </button>

      {FIELDS.map((f) => (
        <div className="field" key={f.key}>
          <label htmlFor={f.key}>
            {f.label} {f.hint && <span className="hint">· {f.hint}</span>}
          </label>
          <input id={f.key} value={setup[f.key]} onChange={set(f.key)} placeholder={f.placeholder} autoComplete="off" />
        </div>
      ))}

      <div className="field-row">
        <div className="field">
          <label htmlFor="safeContactName">Safe contact</label>
          <input
            id="safeContactName"
            value={setup.safeContactName}
            onChange={set("safeContactName")}
            placeholder="e.g. Rahul"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="safeContactRelation">Relation</label>
          <input
            id="safeContactRelation"
            value={setup.safeContactRelation}
            onChange={set("safeContactRelation")}
            placeholder="optional"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="language">Language</label>
        <select id="language" value={setup.language} onChange={() => onChange({ ...setup, language: "en" })}>
          <option value="en">English</option>
          <option disabled>Hindi — coming soon</option>
          <option disabled>Hinglish — coming soon</option>
        </select>
      </div>

      <p className="note">
        <span aria-hidden="true">🔒</span>
        Use first names only. ScamDrill never asks for real account numbers, OTPs or ID numbers, and stores nothing.
      </p>

      <div className="spacer" />
      <button type="submit" className="btn btn-primary" disabled={!ready}>
        Hand to {parent || "your parent"}
      </button>
    </form>
  );
}
