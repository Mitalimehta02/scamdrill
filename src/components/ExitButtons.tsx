/** Always visible during the drill. Either one is a win (prd.md > Endings (Deterministic)). Call never dials. */
export function ExitButtons({ contactLabel, onHangUp, onCall }: { contactLabel: string; onHangUp: () => void; onCall: () => void }) {
  return (
    <div className="exits">
      <button type="button" className="exit exit-hangup" onClick={onHangUp}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 9c-1.6 0-3.2.3-4.6.8v3.1c0 .4-.2.7-.6.9-1 .5-1.9 1.1-2.7 1.8-.2.2-.4.3-.7.3s-.5-.1-.7-.3L.3 13.2c-.2-.2-.3-.4-.3-.7s.1-.5.3-.7C3.3 8.9 7.4 7 12 7s8.7 1.9 11.7 4.8c.2.2.3.4.3.7s-.1.5-.3.7l-2.4 2.4c-.2.2-.4.3-.7.3s-.5-.1-.7-.3c-.8-.7-1.7-1.3-2.7-1.8-.3-.2-.6-.5-.6-.9V9.8C15.2 9.3 13.6 9 12 9z" />
        </svg>
        Hang up
      </button>
      <button type="button" className="exit exit-call" onClick={onCall}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" />
        </svg>
        Call {contactLabel}
      </button>
    </div>
  );
}
