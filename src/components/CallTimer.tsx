import { useEffect, useState } from "react";
import { formatDuration } from "../drill/format";
import { useT } from "../i18n/useT";

/** "● On call 02:14" — ticks while the drill runs; the same start time feeds the report card. */
export function CallTimer({ startedAt, endedAt }: { startedAt: number; endedAt?: number }) {
  const t = useT().drill;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (endedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endedAt]);
  return (
    <div className="call-timer" aria-label={t.onCall}>
      <span className="call-dot" aria-hidden="true" />
      {t.onCall} {formatDuration((endedAt ?? now) - startedAt)}
    </div>
  );
}
