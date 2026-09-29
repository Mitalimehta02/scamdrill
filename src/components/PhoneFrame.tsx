import type { ReactNode } from "react";
import { TrainingStrip } from "./TrainingStrip";

/** Full screen on a phone; a centred phone-sized frame on a laptop. The training strip is always on top. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="stage">
      <div className="phone">
        <TrainingStrip />
        {children}
      </div>
    </div>
  );
}
