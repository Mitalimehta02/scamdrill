import { useEffect, useState } from "react";
import { OTP_SENDER } from "../i18n/strings";
import { useT } from "../i18n/useT";

/** The fake bank SMS that slides down at stage 5 (prd.md > Fake OTP and Pay Card).
 *  It tucks into a small pill after a few seconds so it doesn't cover the chat; tapping reopens it. */
export function OtpBanner({ code }: { code: string }) {
  const t = useT().otp;
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setOpen(false), 9000);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) {
    return (
      <button type="button" className="otp-pill" onClick={() => setOpen(true)}>
        <span aria-hidden="true">💬</span> {t.pill}
      </button>
    );
  }
  return (
    <button type="button" className="otp-banner" onClick={() => setOpen(false)} aria-label={`${OTP_SENDER}: ${code} ${t.body}`}>
      <div className="otp-head">
        <span className="otp-app" aria-hidden="true">💬</span>
        <strong>{OTP_SENDER}</strong>
        <span className="otp-now">{t.now}</span>
      </div>
      <div className="otp-body">
        <b className="otp-code">{code}</b> {t.body}
      </div>
    </button>
  );
}
