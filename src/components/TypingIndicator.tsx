import { useT } from "../i18n/useT";

export function TypingIndicator() {
  return (
    <div className="typing" aria-label={useT().drill.replyWaiting}>
      <span />
      <span />
      <span />
    </div>
  );
}
