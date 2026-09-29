import { useEffect, useState } from "react";

/** The fake bank SMS that slides down at stage 5 (prd.md > Fake OTP and Pay Card).
 *  It tucks into a small pill after a few seconds so it doesn't cover the chat; tapping reopens it. */
export function OtpBanner({ code }: { code: string }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 9000);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) {
    return (
      <button type="button" className="otp-pill" onClick={() => setOpen(true)}>
        <span aria-hidden="true">💬</span> New message · BANK-OTP
      </button>
    );
  }
  return (
    <button
      type="button"
      className="otp-banner"
      onClick={() => setOpen(false)}
      aria-label={`Text message from BANK-OTP: ${code} is your OTP. Tap to hide.`}
    >
      <div className="otp-head">
        <span className="otp-app" aria-hidden="true">💬</span>
        <strong>BANK-OTP</strong>
        <span className="otp-now">now</span>
      </div>
      <div className="otp-body">
        <b className="otp-code">{code}</b> is your OTP for account verification. Do not share it with anyone.
      </div>
    </button>
  );
}
