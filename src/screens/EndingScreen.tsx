// Placeholder for slice 2. Slice 4 replaces this with the full kind, teaching ending (prd.md > Parent Ending Screen).

import type { Ending } from "../drill/reducer";

const LABELS: Record<Ending["reason"], string> = {
  hangup: "Hung up",
  call: "Called your safe contact",
  otp: "Shared the OTP",
  sensitive: "Tried to share a code or personal number",
  pay: "Sent money",
  stayed: "Stayed on the line too long",
};

export function EndingScreen({ ending, onRestart }: { ending: Ending; onRestart: () => void }) {
  return (
    <div className="screen ending">
      <h1>{ending.type === "win" ? "You hung up. That's exactly right." : "Drill ended"}</h1>
      <p className="lede">{LABELS[ending.reason]}</p>
      <button type="button" className="btn btn-primary" onClick={onRestart}>
        Run another drill
      </button>
    </div>
  );
}
