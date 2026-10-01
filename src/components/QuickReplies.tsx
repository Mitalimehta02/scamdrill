import { useT } from "../i18n/useT";

/** Big tappable replies so the parent doesn't have to type (prd.md > The Drill Screen). */
export function QuickReplies({
  contactName,
  disabled,
  onPick,
}: {
  contactName: string;
  disabled: boolean;
  onPick: (text: string) => void;
}) {
  const replies = useT().drill.quickReplies(contactName);
  return (
    <div className="quick-replies" role="group" aria-label="Quick replies">
      {replies.map((r) => (
        <button key={r} type="button" className="quick-reply" disabled={disabled} onClick={() => onPick(r)}>
          {r}
        </button>
      ))}
    </div>
  );
}
