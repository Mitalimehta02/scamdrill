/** 134000 → "02:14" — used for the on-call timer and the report card's time on the line. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** A chat-style timestamp: "11:42 pm" in English and Hinglish, 24-hour "23:42" in Hindi (no Latin "pm"). */
export function formatClock(at: number, locale = "en-IN"): string {
  const hour12 = !locale.startsWith("hi");
  return new Date(at).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12, numberingSystem: "latn" });
}
