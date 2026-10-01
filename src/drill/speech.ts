// Optional read-aloud for Sharma's lines (spec.md > Read-Aloud). Uses only the browser's own speechSynthesis:
// no dependency, nothing sent anywhere. Off by default; the toggle is hidden when no suitable voice exists.

import { useEffect, useState } from "react";
import type { Lang } from "../i18n/strings";

type VoiceLike = Pick<SpeechSynthesisVoice, "lang" | "name">;

/** Hindi voice for Hindi (Devanagari); Indian English for English and Hinglish (Roman script). Null if the device has none. */
export function pickVoice<V extends VoiceLike>(voices: V[], lang: Lang): V | null {
  const wanted = lang === "hi" ? "hi-in" : "en-in";
  const norm = (l: string) => l.replace("_", "-").toLowerCase();
  return voices.find((v) => norm(v.lang) === wanted) ?? null;
}

function synth(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
}

/** The voice for this language, updating when the browser finishes loading its voices. */
export function useVoice(lang: Lang): SpeechSynthesisVoice | null {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(() => {
    const s = synth();
    return s ? pickVoice(s.getVoices(), lang) : null;
  });
  useEffect(() => {
    const s = synth();
    if (!s) return;
    const update = () => setVoice(pickVoice(s.getVoices(), lang));
    update();
    s.addEventListener("voiceschanged", update);
    return () => s.removeEventListener("voiceschanged", update);
  }, [lang]);
  return voice;
}

export function speak(text: string, voice: SpeechSynthesisVoice): void {
  const s = synth();
  if (!s) return;
  s.cancel(); // never queue up lines behind each other
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.95; // a little slower, for older listeners
  s.speak(u);
}

export function stopSpeaking(): void {
  synth()?.cancel();
}
