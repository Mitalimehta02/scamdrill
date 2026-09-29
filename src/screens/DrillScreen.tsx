// prd.md > The Drill Screen. The browser is the referee: the reducer owns stage and pressure;
// this screen only asks the server for words and labels, then hands the results to the reducer.

import { useEffect, useRef, useState, type Dispatch } from "react";
import { Badge } from "../components/Badge";
import { CallTimer } from "../components/CallTimer";
import { ChatBubble } from "../components/ChatBubble";
import { ExitButtons } from "../components/ExitButtons";
import { OfflineNote } from "../components/OfflineNote";
import { PressureMeter } from "../components/PressureMeter";
import { TypingIndicator } from "../components/TypingIndicator";
import { classify, getScammerLine } from "../drill/api";
import { fill, toPlaceholders } from "../drill/placeholders";
import { apiHistory, type DrillAction, type DrillState } from "../drill/reducer";
import { STAGES } from "../drill/script";
import { safeContactLabel, type FamilySetup } from "../drill/setup";

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
  const [draft, setDraft] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  // Whenever it's the scammer's turn: get a line (AI or canned), show it, then tag it.
  useEffect(() => {
    if (drill.ending || drill.awaiting !== "scammer") return;
    let cancelled = false;
    const stage = drill.stage;
    getScammerLine(stage, apiHistory(drill.messages), { demo }).then((line) => {
      if (cancelled) return;
      const id = nextId++;
      // Show the bubble straight away; the chip animates in when the classifier answers.
      dispatch({ type: "SCAMMER_MESSAGE", id, text: line.text, aiFailed: line.aiFailed, now: Date.now() });
      classify(line.text, STAGES[stage].plannedTactic, { demo }).then((tag) =>
        dispatch({ type: "TAG", id, tactic: tag.tactic, source: tag.source }),
      );
    });
    return () => {
      cancelled = true;
    };
    // Only a change of turn or stage should trigger a new request.
  }, [drill.awaiting, drill.stage, drill.ending, demo]);

  // Keep the newest message in view.
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [drill.messages, drill.awaiting]);

  const canReply = drill.awaiting === "parent" && !drill.ending;
  const typing = drill.awaiting === "scammer" && !drill.ending;

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !canReply) return;
    // Real names never leave the browser: "Is Rahul safe?" is stored and sent as "Is {SAFE_CONTACT} safe?".
    dispatch({ type: "PARENT_REPLY", id: nextId++, text: toPlaceholders(text, setup), now: Date.now() });
    setDraft("");
  }

  return (
    <div className="drill">
      <header className="drill-header">
        <div className="caller">
          <Badge size={44} />
          <div className="caller-id">
            <div className="caller-name">Inspector Sharma</div>
            <div className={`caller-sub${typing ? " typing-text" : ""}`}>{typing ? "typing…" : "CBI Cyber Cell"}</div>
          </div>
          <CallTimer startedAt={drill.startedAt} endedAt={drill.endedAt} />
        </div>
        <PressureMeter value={drill.pressure} />
      </header>

      <div className="chat" ref={chatRef} aria-live="polite">
        {drill.messages.map((m) => (
          <ChatBubble key={m.id} role={m.role} text={fill(m.text, setup)} at={m.at} tactic={m.tactic} />
        ))}
        {typing && <TypingIndicator />}
        {drill.offlineMode && <OfflineNote />}
      </div>

      <footer className="drill-footer">
        <ExitButtons
          contactLabel={safeContactLabel(setup)}
          onHangUp={() => dispatch({ type: "EXIT", reason: "hangup", now: Date.now() })}
          onCall={() => dispatch({ type: "EXIT", reason: "call", now: Date.now() })}
        />
        <form className="compose" onSubmit={send}>
          <label htmlFor="reply" className="sr-only">
            Your reply
          </label>
          <input
            id="reply"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={canReply ? "Type a reply…" : "Inspector Sharma is typing…"}
            autoComplete="off"
          />
          <button type="submit" disabled={!canReply || !draft.trim()} aria-label="Send">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M3 20.5l18-8.5L3 3.5v6.6l12 1.9-12 1.9z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
