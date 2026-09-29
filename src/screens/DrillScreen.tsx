// prd.md > The Drill Screen. The browser is the referee: the reducer owns stage, pressure and endings;
// this screen only asks the server for words and labels, then hands the results to the reducer.

import { useEffect, useRef, useState, type Dispatch } from "react";
import { Badge } from "../components/Badge";
import { CallTimer } from "../components/CallTimer";
import { ChatBubble } from "../components/ChatBubble";
import { ExitButtons } from "../components/ExitButtons";
import { OfflineNote } from "../components/OfflineNote";
import { OtpBanner } from "../components/OtpBanner";
import { PayCard } from "../components/PayCard";
import { PressureMeter } from "../components/PressureMeter";
import { TypingIndicator } from "../components/TypingIndicator";
import { classify, getScammerLine } from "../drill/api";
import { checkReply } from "../drill/guard";
import { fill, toPlaceholders } from "../drill/placeholders";
import { apiHistory, type DrillAction, type DrillState } from "../drill/reducer";
import { STAGES } from "../drill/script";
import { safeContactLabel, type FamilySetup } from "../drill/setup";
import { useT } from "../i18n/useT";

const SILENCE_MS = 25000;
let nextId = 1;

export function DrillScreen({
  drill,
  dispatch,
  setup,
  demo,
}: {
  drill: DrillState;
  dispatch: Dispatch<DrillAction>;
  setup: FamilySetup;
  demo: boolean;
}) {
  const t = useT().drill;
  const language = setup.language;
  const [draft, setDraft] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  // Whenever it's the scammer's turn: get a line (AI or canned), show it, then tag it.
  useEffect(() => {
    if (drill.ending || drill.awaiting !== "scammer") return;
    let cancelled = false;
    const stage = drill.stage;
    const nudge = drill.pendingNudge;
    getScammerLine(stage, apiHistory(drill.messages), { demo, nudge, language }).then((line) => {
      if (cancelled) return;
      const id = nextId++;
      // Show the bubble straight away; the chip animates in when the classifier answers.
      dispatch({ type: "SCAMMER_MESSAGE", id, text: line.text, aiFailed: line.aiFailed, now: Date.now(), nudge });
      classify(line.text, STAGES[stage].plannedTactic, { demo, nudge }).then((tag) =>
        dispatch({ type: "TAG", id, tactic: tag.tactic, source: tag.source }),
      );
    });
    return () => {
      cancelled = true;
    };
    // Only a change of turn, stage or nudge should trigger a new request.
  }, [drill.awaiting, drill.stage, drill.ending, drill.pendingNudge, demo, language]);

  // Silence: after 25 s without a reply, the scammer sends one nudge (at most one per stage).
  // Typing resets the clock, so a slow typist isn't interrupted mid-reply.
  useEffect(() => {
    if (drill.ending || drill.awaiting !== "parent" || drill.nudgedThisStage) return;
    const t = setTimeout(() => dispatch({ type: "NUDGE_DUE" }), SILENCE_MS);
    return () => clearTimeout(t);
  }, [drill.awaiting, drill.stage, drill.ending, drill.nudgedThisStage, draft, dispatch]);

  // Keep the newest message in view — but never scroll past its top. A long line (or line + chip)
  // that doesn't fit is shown from its first word, so the parent reads it from the start.
  const messageCount = drill.messages.length;
  const lastTagged = drill.messages[messageCount - 1]?.tactic;
  useEffect(() => {
    const chat = chatRef.current;
    if (!chat) return;
    const all = chat.querySelectorAll<HTMLElement>(".msg");
    const last = all[all.length - 1];
    const bottom = chat.scrollHeight - chat.clientHeight;
    const top = last ? last.offsetTop - 8 : bottom;
    chat.scrollTo({ top: Math.min(bottom, top), behavior: "smooth" });
  }, [messageCount, lastTagged, drill.awaiting]);

  const canReply = drill.awaiting === "parent" && !drill.ending;
  const typing = drill.awaiting === "scammer" && !drill.ending;

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !canReply) return;
    // The safety guard runs first. A match ends the drill, and the text is never stored or sent.
    const verdict = checkReply(text, { fakeOtp: drill.fakeOtp, stage: drill.stage });
    setDraft("");
    if (verdict !== "ok") {
      dispatch({ type: "GUARD_LOSS", kind: verdict, now: Date.now() });
      return;
    }
    // Real names never leave the browser: "Is Rahul safe?" is stored and sent as "Is {SAFE_CONTACT} safe?".
    dispatch({ type: "PARENT_REPLY", id: nextId++, text: toPlaceholders(text, setup), now: Date.now() });
  }

  const exit = (reason: "hangup" | "call" | "pay") => dispatch({ type: "EXIT", reason, now: Date.now() });

  return (
    <div className="drill">
      <header className="drill-header">
        <div className="caller">
          <Badge size={36} />
          <div className="caller-id">
            <div className="caller-name">{t.caller}</div>
            <div className={`caller-sub${typing ? " typing-text" : ""}`}>{typing ? t.typing : t.callerSub}</div>
          </div>
          <CallTimer startedAt={drill.startedAt} endedAt={drill.endedAt} />
        </div>
        <PressureMeter value={drill.pressure} />
      </header>

      <div className="chat-wrap">
        {/* Drops in below the header, so the meter and timer stay visible at the OTP moment. */}
        {drill.otpVisible && <OtpBanner code={drill.fakeOtp} />}

        <div className="chat" ref={chatRef} aria-live="polite">
          <div className="system-note">{t.incoming}</div>
          {drill.messages.map((m) =>
            m.kind === "pay" ? (
              <PayCard key={m.id} disabled={!!drill.ending} onPay={() => exit("pay")} />
            ) : (
              <ChatBubble key={m.id} role={m.role} text={fill(m.text, setup)} at={m.at} tactic={m.tactic} />
            ),
          )}
          {typing && <TypingIndicator />}
          {drill.offlineMode && <OfflineNote />}
        </div>
      </div>

      <footer className="drill-footer">
        <ExitButtons contactLabel={safeContactLabel(setup)} onHangUp={() => exit("hangup")} onCall={() => exit("call")} />
        <form className="compose" onSubmit={send}>
          <label htmlFor="reply" className="sr-only">
            {t.reply}
          </label>
          <input
            id="reply"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={canReply ? t.reply : t.replyWaiting}
            autoComplete="off"
          />
          <button type="submit" disabled={!canReply || !draft.trim()} aria-label={t.send}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M3 20.5l18-8.5L3 3.5v6.6l12 1.9-12 1.9z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
