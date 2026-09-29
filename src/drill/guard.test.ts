import { describe, expect, it } from "vitest";
import { checkReply } from "./guard";

const OTP = "730514";
const at = (stage: number) => ({ fakeOtp: OTP, stage });

describe("the exact fake OTP", () => {
  it("is 'Shared the OTP', even with spaces", () => {
    expect(checkReply("730514", at(5))).toBe("otp");
    expect(checkReply("ok sir it is 730 514", at(5))).toBe("otp");
  });
});

describe("PRD examples that must NOT end the drill", () => {
  it.each([
    ["I was born in 1952", 6],
    ["my flat is 1204", 3],
    ["my flat is 1204", 6],
    ["I only have ₹5000", 7],
    ["I only have Rs. 5000", 7],
    ["I can give 5000 rupees", 8],
    ["call me on +91 98765 43210", 4],
    ["my son's number is 9876543210", 6],
    ["I have been with SBI since 1985", 2],
    ["Who is this?", 1],
  ])("%s (stage %i)", (text, stage) => {
    expect(checkReply(text, at(stage))).toBe("ok");
  });
});

describe("PRD examples that MUST end the drill", () => {
  it.each([
    ["482913", 5], // a code typed after the fake SMS appeared
    ["ok 482913", 6],
    ["my PIN is 4521", 2], // any stage
    ["the code is 7788", 1],
    ["CVV 123", 3],
    ["1234 5678 9012", 2], // Aadhaar, spaced
    ["my aadhaar 123456789012", 1],
    ["4111 1111 1111 1111", 4], // card
    ["ABCDE1234F", 3], // PAN
    ["pan is abcde1234f", 3],
    ["4521 is my pin", 2],
  ])("%s (stage %i)", (text, stage) => {
    expect(checkReply(text, at(stage))).toBe("sensitive");
  });
});

describe("stage matters for bare short numbers", () => {
  it("a bare 6-digit number before the SMS is not treated as a code", () => {
    expect(checkReply("482913", at(3))).toBe("ok");
  });
});
