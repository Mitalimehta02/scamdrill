// The one path every parent reply takes, typed or tapped (prd.md > The Drill Screen):
// safety guard first → real names to placeholders → a PARENT_REPLY for the reducer.

import { checkReply } from "./guard";
import { toPlaceholders } from "./placeholders";
import type { FamilySetup } from "./setup";

export type PreparedReply =
  | { kind: "loss"; verdict: "otp" | "sensitive" }
  | { kind: "reply"; text: string }
  | { kind: "empty" };

export function prepareReply(raw: string, ctx: { fakeOtp: string; stage: number; setup: FamilySetup }): PreparedReply {
  const text = raw.trim();
  if (!text) return { kind: "empty" };
  const verdict = checkReply(text, { fakeOtp: ctx.fakeOtp, stage: ctx.stage });
  if (verdict !== "ok") return { kind: "loss", verdict }; // never stored, never sent
  return { kind: "reply", text: toPlaceholders(text, ctx.setup) };
}
