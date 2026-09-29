/** A generic shield badge — deliberately not any real agency's emblem. */
export function Badge({ size = 44, tone = "light" }: { size?: number; tone?: "light" | "dark" }) {
  const fill = tone === "light" ? "#ffffff" : "#1b2a41";
  const inner = tone === "light" ? "#1b2a41" : "#ffffff";
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <circle cx="22" cy="22" r="22" fill={tone === "light" ? "rgba(255,255,255,0.14)" : "#e7eaef"} />
      <path d="M22 9l11 4v8c0 7-4.7 12.3-11 14-6.3-1.7-11-7-11-14v-8z" fill={fill} />
      <path d="M22 15l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6z" fill={inner} />
    </svg>
  );
}
