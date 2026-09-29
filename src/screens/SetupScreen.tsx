// prd.md > Family Setup — the child fills this in, then hands the phone over.
// Picking a language switches the whole app straight away (prd.md > Languages).

import { Badge } from "../components/Badge";
import { DEMO_SETUP, isSetupComplete, type FamilySetup } from "../drill/setup";
import { LANGS, type Lang } from "../i18n/strings";
import { useT } from "../i18n/useT";

type TextKey = Exclude<keyof FamilySetup, "language">;

export function SetupScreen({
  setup,
  onChange,
  onHandOff,
}: {
  setup: FamilySetup;
  onChange: (next: FamilySetup) => void;
  onHandOff: () => void;
}) {
  const t = useT().setup;
  const set = (key: TextKey) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...setup, [key]: e.target.value });
  const ready = isSetupComplete(setup);
  const parent = setup.parentName.trim();

  const fields: { key: TextKey; label: string; example: string; hint?: string }[] = [
    { key: "childName", label: t.yourName, example: t.examples.child },
    { key: "parentName", label: t.parentName, example: t.examples.parent, hint: t.parentHint },
    { key: "bank", label: t.bank, example: t.examples.bank },
    { key: "grandchildName", label: t.grandchild, example: t.examples.grandchild },
  ];

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
      <h1>{t.title}</h1>
      <p className="lede">{t.lede}</p>

      {/* Language first: it changes everything below. Demo details keep the chosen language. */}
      <div className="field">
        <label htmlFor="language">{t.language}</label>
        <select id="language" value={setup.language} onChange={(e) => onChange({ ...setup, language: e.target.value as Lang })}>
          {LANGS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="btn btn-secondary" onClick={() => onChange({ ...DEMO_SETUP, safeContactRelation: t.demoRelation, language: setup.language })}>
        {t.demoButton}
      </button>

      {fields.map((f) => (
        <div className="field" key={f.key}>
          <label htmlFor={f.key}>
            {f.label} {f.hint && <span className="hint">· {f.hint}</span>}
          </label>
          <input id={f.key} value={setup[f.key]} onChange={set(f.key)} placeholder={f.example} autoComplete="off" />
        </div>
      ))}

      <div className="field-row">
        <div className="field">
          <label htmlFor="safeContactName">{t.safeContact}</label>
          <input
            id="safeContactName"
            value={setup.safeContactName}
            onChange={set("safeContactName")}
            placeholder={t.examples.safeContact}
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="safeContactRelation">{t.relation}</label>
          <input
            id="safeContactRelation"
            value={setup.safeContactRelation}
            onChange={set("safeContactRelation")}
            placeholder={t.relationPlaceholder}
            autoComplete="off"
          />
        </div>
      </div>

      <p className="note">
        <span aria-hidden="true">🔒</span>
        {t.note}
      </p>

      <div className="spacer" />
      <button type="submit" className="btn btn-primary" disabled={!ready}>
        {t.handTo(parent || t.yourParent)}
      </button>
    </form>
  );
}
