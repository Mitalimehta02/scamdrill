/** Rises by fixed points per tactic; never reads the parent's replies (prd.md > Tactic Tagging and Pressure Meter).
 *  Its colour shifts slate → amber → red as it fills, so rising pressure reads on camera. One compact row. */
export function meterLevel(value: number): "low" | "mid" | "high" {
  if (value >= 70) return "high";
  if (value >= 35) return "mid";
  return "low";
}

export function PressureMeter({ value }: { value: number }) {
  return (
    <div className={`meter meter-${meterLevel(value)}`}>
      <span className="meter-name">Pressure</span>
      <div
        className="meter-track"
        role="meter"
        aria-label="Scam pressure"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className="meter-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="meter-value">{value}%</span>
    </div>
  );
}
