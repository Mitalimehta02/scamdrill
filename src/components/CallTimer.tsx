import { useEffect, useState } from "react";
import { formatDuration } from "../drill/format";

/** "● On call 02:14" — ticks while the drill runs; the same start time feeds the report card. */
export function CallTimer({ startedAt, endedAt }: { startedAt: number; endedAt?: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (endedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endedAt]);
  return (
    <div className="call-timer" aria-label="Time on the call">
      <span className="call-dot" aria-hidden="true" />
      On call {formatDuration((endedAt ?? now) - startedAt)}
    </div>
  );
}
