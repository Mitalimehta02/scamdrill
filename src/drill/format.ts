/** 134000 → "02:14" — used for the on-call timer and the report card's time on the line. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** A chat-style timestamp, e.g. "11:42 pm". */
export function formatClock(at: number): string {
  return new Date(at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}
