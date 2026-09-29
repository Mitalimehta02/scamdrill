import { describe, expect, it } from "vitest";
import { fill, toPlaceholders } from "./placeholders";
import { DEMO_SETUP, EMPTY_SETUP } from "./setup";

describe("fill", () => {
  it("swaps placeholders for the family's details and the fake payment", () => {
    expect(fill("Namaste {PARENT} ji, your account at {BANK}.", DEMO_SETUP)).toBe("Namaste Kamala ji, your account at SBI.");
    expect(fill("Transfer {AMOUNT} to {ACCOUNT}.", DEMO_SETUP)).toBe("Transfer ₹2,50,000 to RBI-SAFE-0042-7781-3309.");
  });

  it("is harmless when a placeholder is missing, and removes unknown ones", () => {
    expect(fill("Stay on the line.", DEMO_SETUP)).toBe("Stay on the line.");
    expect(fill("Protect {NOBODY} now.", DEMO_SETUP)).toBe("Protect now.");
  });

  it("falls back to Sir/Madam when the parent's name is empty", () => {
    expect(fill("Hello {PARENT} ji.", EMPTY_SETUP)).toBe("Hello Sir/Madam.");
  });
});

describe("toPlaceholders", () => {
  it("replaces every setup value the parent types, in any case", () => {
    expect(toPlaceholders("Is rahul safe? Tell Anjali. My SBI account. Aarav is 9.", DEMO_SETUP)).toBe(
      "Is {SAFE_CONTACT} safe? Tell {CHILD}. My {BANK} account. {GRANDCHILD} is 9.",
    );
    expect(toPlaceholders("I am Kamala", DEMO_SETUP)).toBe("I am {PARENT}");
  });

  it("does not touch words that merely contain a name", () => {
    expect(toPlaceholders("Rahulji and SBIcard", DEMO_SETUP)).toBe("Rahulji and SBIcard");
  });

  it("round-trips back to the real names for display", () => {
    const typed = "Please don't involve Aarav";
    expect(fill(toPlaceholders(typed, DEMO_SETUP), DEMO_SETUP)).toBe(typed);
  });
});
