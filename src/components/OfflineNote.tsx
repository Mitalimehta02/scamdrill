import { useT } from "../i18n/useT";

/** Small, non-alarming note after 3 AI failures in a row. The drill carries on with canned lines. */
export function OfflineNote() {
  return <div className="offline-note">{useT().drill.offline}</div>;
}
