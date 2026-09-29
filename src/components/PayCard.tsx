import { FAKE_PAYMENT } from "../drill/tactics";
import { useT } from "../i18n/useT";

/** Realistic but clearly fictional. Tapping Pay ends the drill as "Sent money"; no money ever moves. */
export function PayCard({ onPay, disabled }: { onPay: () => void; disabled: boolean }) {
  const t = useT().pay;
  return (
    <div className="msg scammer">
      <div className="pay-card">
        <div className="pay-title">
          <span aria-hidden="true">🏛️</span> {t.title}
        </div>
        <dl className="pay-rows">
          <dt>{t.account}</dt>
          <dd>{FAKE_PAYMENT.account}</dd>
          <dt>{t.amount}</dt>
          <dd className="pay-amount">{FAKE_PAYMENT.amount}</dd>
        </dl>
        <button type="button" className="pay-button" onClick={onPay} disabled={disabled}>
          {t.pay(FAKE_PAYMENT.amount)}
        </button>
        <div className="pay-fine">{t.fine}</div>
      </div>
    </div>
  );
}
