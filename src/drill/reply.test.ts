import { describe, expect, it } from "vitest";
import { STRINGS } from "../i18n/strings";
import { drillReducer, initialDrill } from "./reducer";
import { prepareReply } from "./reply";
import { DEMO_SETUP } from "./setup";

const ctx = (stage: number) => ({ fakeOtp: "730514", stage, setup: DEMO_SETUP });

describe("quick replies", () => {
  for (const lang of ["en", "hi", "hinglish"] as const) {
    const replies = STRINGS[lang].drill.quickReplies("Rahul");

    it(`${lang}: contain no digits, so they can never trip the safety guard (at any stage)`, () => {
      for (const r of replies) {
        expect(r).not.toMatch(/\p{Nd}/u);
        for (let stage = 1; stage <= 10; stage++) expect(prepareReply(r, ctx(stage)).kind).toBe("reply");
      }
    });

    it(`${lang}: the safe contact's name is replaced before anything is sent`, () => {
      const prepared = prepareReply(replies[2], ctx(3));
      expect(prepared.kind).toBe("reply");
      if (prepared.kind === "reply") {
        expect(prepared.text).toContain("{SAFE_CONTACT}");
        expect(prepared.text).not.toContain("Rahul");
      }
    });
  }

  it("a tapped reply advances the drill exactly like a typed one", () => {
    const start = drillReducer(initialDrill(0, "730514"), { type: "SCAMMER_MESSAGE", id: 1, text: "x", aiFailed: false, now: 0 });
    const tapped = prepareReply(STRINGS.en.drill.quickReplies("Rahul")[0], ctx(1));
    const typed = prepareReply("Who is this?", ctx(1));
    expect(tapped).toEqual(typed);
    if (tapped.kind !== "reply") throw new Error("expected a reply");
    const next = drillReducer(start, { type: "PARENT_REPLY", id: 2, text: tapped.text, now: 0 });
    expect(next.stage).toBe(2);
    expect(next.awaiting).toBe("scammer");
  });
});

describe("prepareReply (the shared path)", () => {
  it("blocks the fake OTP and sensitive numbers before anything is stored or sent", () => {
    expect(prepareReply("it is 730514", ctx(5))).toEqual({ kind: "loss", verdict: "otp" });
    expect(prepareReply("my PIN is 4521", ctx(2))).toEqual({ kind: "loss", verdict: "sensitive" });
    expect(prepareReply("   ", ctx(2))).toEqual({ kind: "empty" });
  });
});
