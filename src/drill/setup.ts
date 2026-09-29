// The family's details, held only in React memory (spec.md > Data Model). Never stored, never sent to the AI.

export interface FamilySetup {
  childName: string;
  parentName: string;
  bank: string;
  grandchildName: string;
  safeContactName: string;
  safeContactRelation: string; // optional, e.g. "son"
  language: "en";
}

export const EMPTY_SETUP: FamilySetup = {
  childName: "",
  parentName: "",
  bank: "",
  grandchildName: "",
  safeContactName: "",
  safeContactRelation: "",
  language: "en",
};

// Fictional values for the demo video (prd.md > Family Setup).
export const DEMO_SETUP: FamilySetup = {
  childName: "Anjali",
  parentName: "Kamala",
  bank: "SBI",
  grandchildName: "Aarav",
  safeContactName: "Rahul",
  safeContactRelation: "son",
  language: "en",
};

export function isSetupComplete(s: FamilySetup): boolean {
  return [s.childName, s.parentName, s.bank, s.grandchildName, s.safeContactName].every((v) => v.trim() !== "");
}

/** "Rahul (son)" or just "Rahul". */
export function safeContactLabel(s: FamilySetup): string {
  const rel = s.safeContactRelation.trim();
  return rel ? `${s.safeContactName.trim()} (${rel})` : s.safeContactName.trim();
}
