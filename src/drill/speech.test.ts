import { describe, expect, it } from "vitest";
import { pickVoice } from "./speech";

const voices = [
  { name: "US English", lang: "en-US" },
  { name: "Ravi", lang: "en-IN" },
  { name: "Kalpana", lang: "hi-IN" },
];

describe("pickVoice", () => {
  it("uses a Hindi voice for Hindi only, and Indian English for English and Roman-script Hinglish", () => {
    expect(pickVoice(voices, "en")?.name).toBe("Ravi");
    expect(pickVoice(voices, "hi")?.name).toBe("Kalpana");
    expect(pickVoice(voices, "hinglish")?.name).toBe("Ravi");
  });

  it("accepts underscore or lower-case language tags (some browsers report hi_IN)", () => {
    expect(pickVoice([{ name: "x", lang: "hi_in" }], "hi")?.name).toBe("x");
  });

  it("returns null when there's no suitable voice, so the toggle can be hidden", () => {
    expect(pickVoice([{ name: "US English", lang: "en-US" }], "hi")).toBeNull();
    expect(pickVoice([], "en")).toBeNull();
  });
});
