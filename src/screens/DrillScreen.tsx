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
import { MAX_REPLY_CHARS, REPLY_COUNTER_FROM } from "../drill/limits";
import { fill } from "../drill/placeholders";
import { prepareReply } from "../drill/reply";
import { speak, stopSpeaking, useVoice } from "../drill/speech";
import { QuickReplies } from "../components/QuickReplies";
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
  // Read-aloud: off by default, and only offered when the device has a suitable voice.
  const voice = useVoice(language);
  const [readAloud, setReadAloud] = useState(false);
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

  // Speak each new line from Sharma (never the Pay card) in its filled-in form.
  const lastMessage = drill.messages[drill.messages.length - 1];
  useEffect(() => {
    if (readAloud && voice && lastMessage?.role === "scammer" && lastMessage.kind !== "pay") speak(fill(lastMessage.text, setup), voice);
    // Only a new message should trigger speech.
  }, [lastMessage?.id]);
  useEffect(() => {
    if (!readAloud || drill.ending) stopSpeaking();
  }, [readAloud, drill.ending]);
  useEffect(() => () => stopSpeaking(), []);

  const canReply = drill.awaiting === "parent" && !drill.ending;
  const typing = drill.awaiting === "scammer" && !drill.ending;

  // Typed and tapped replies take the same path: safety guard → placeholders → reducer.
  function sendText(raw: string) {
    if (!canReply) return;
    const prepared = prepareReply(raw, { fakeOtp: drill.fakeOtp, stage: drill.stage, setup });
    if (prepared.kind === "empty") return;
    setDraft("");
    if (prepared.kind === "loss") {
      // A match ends the drill, and the text is never stored or sent.
      dispatch({ type: "GUARD_LOSS", kind: prepared.verdict, now: Date.now() });
      return;
    }
    // Real names never leave the browser: "Is Rahul safe?" is stored and sent as "Is {SAFE_CONTACT} safe?".
    dispatch({ type: "PARENT_REPLY", id: nextId++, text: prepared.text, now: Date.now() });
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    sendText(draft);
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
        <div className="meter-row">
          <PressureMeter value={drill.pressure} />
          {voice && (
            <button
              type="button"
              className={`speak-toggle${readAloud ? " on" : ""}`}
              aria-pressed={readAloud}
              aria-label={readAloud ? t.readAloudOn : t.readAloudOff}
              title={readAloud ? t.readAloudOn : t.readAloudOff}
              onClick={() => setReadAloud((on) => !on)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3z" />
                {readAloud ? (
                  <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />
                ) : (
                  <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M16 9l5 6M21 9l-5 6" />
                )}
              </svg>
            </button>
          )}
        </div>
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
        {/* Hidden while typing, so the chat keeps its space; they come back when the box is empty. */}
        {!draft && <QuickReplies contactName={setup.safeContactName.trim()} disabled={!canReply} onPick={sendText} />}
        <form className="compose" onSubmit={send}>
          <label htmlFor="reply" className="sr-only">
            {t.reply}
          </label>
          <input
            id="reply"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_REPLY_CHARS))}
            maxLength={MAX_REPLY_CHARS}
            placeholder={canReply ? t.reply : t.replyWaiting}
            autoComplete="off"
            aria-describedby={draft.length >= REPLY_COUNTER_FROM ? "reply-count" : undefined}
          />
          <button type="submit" disabled={!canReply || !draft.trim()} aria-label={t.send}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M3 20.5l18-8.5L3 3.5v6.6l12 1.9-12 1.9z" />
            </svg>
          </button>
        </form>
        {draft.length >= REPLY_COUNTER_FROM && (
          <div id="reply-count" className="reply-count" aria-live="polite">
            {draft.length}/{MAX_REPLY_CHARS}
          </div>
        )}
      </footer>
    </div>
  );
}
