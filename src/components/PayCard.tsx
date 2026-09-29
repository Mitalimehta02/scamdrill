import { FAKE_PAYMENT } from "../drill/tactics";

/** Realistic but clearly fictional. Tapping Pay ends the drill as "Sent money"; no money ever moves. */
export function PayCard({ onPay, disabled }: { onPay: () => void; disabled: boolean }) {
  return (
    <div className="msg scammer">
      <div className="pay-card">
        <div className="pay-title">
          <span aria-hidden="true">🏛️</span> RBI Safe Account
        </div>
        <dl className="pay-rows">
          <dt>Account</dt>
          <dd>{FAKE_PAYMENT.account}</dd>
          <dt>Amount</dt>
          <dd className="pay-amount">{FAKE_PAYMENT.amount}</dd>
        </dl>
        <button type="button" className="pay-button" onClick={onPay} disabled={disabled}>
          Pay {FAKE_PAYMENT.amount}
        </button>
        <div className="pay-fine">Fictional account for practice. No money moves.</div>
      </div>
    </div>
  );
}
