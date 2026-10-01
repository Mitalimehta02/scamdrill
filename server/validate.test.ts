import { describe, expect, it } from "vitest";
import { parseHistory } from "./validate";
import { MAX_REPLY_CHARS, SERVER_BODY_LIMIT_BYTES, SERVER_MAX_TEXT } from "../src/drill/limits";
import { STAGES } from "../src/drill/script";

describe("a maximum-length reply never breaks the next scammer call", () => {
  // The worst case: every parent reply is the longest allowed, in Devanagari (3 bytes per character).
  const longest = "क".repeat(MAX_REPLY_CHARS);
  const history = [5, 6, 7].flatMap((s) => [
    { role: "scammer" as const, text: STAGES[s].cannedLine.hi },
    { role: "parent" as const, text: longest },
  ]);

  it("the server accepts the history (every message within its limit)", () => {
    expect(MAX_REPLY_CHARS).toBeLessThanOrEqual(SERVER_MAX_TEXT);
    expect(parseHistory(history)).toHaveLength(6);
  });

  it("the request body stays under the server's 12 kB limit", () => {
    const body = JSON.stringify({ stage: 8, history, nudge: false, language: "hi" });
    expect(new TextEncoder().encode(body).length).toBeLessThan(SERVER_BODY_LIMIT_BYTES);
  });

  it("a reply over the server limit would be rejected (the bug the cap prevents)", () => {
    expect(parseHistory([{ role: "parent", text: "a".repeat(SERVER_MAX_TEXT + 1) }])).toBeNull();
  });
});
