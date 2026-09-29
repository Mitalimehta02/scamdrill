// Numbers can be written in many scripts: "४८२९१३" is the same code as "482913".
// Both safety checks (the browser guard and the server's output check) run on the normalised text,
// so no script can smuggle a number past them (spec.md > Digit Normaliser).

// First code point ("zero") of each Unicode decimal-digit block we care about.
const ZEROS = [
  0x0660, // Arabic-Indic
  0x06f0, // Extended Arabic-Indic
  0x0966, // Devanagari (Hindi, Marathi, Nepali)
  0x09e6, // Bengali
  0x0a66, // Gurmukhi
  0x0ae6, // Gujarati
  0x0b66, // Odia
  0x0be6, // Tamil
  0x0c66, // Telugu
  0x0ce6, // Kannada
  0x0d66, // Malayalam
  0xff10, // Full-width
];

export function normalizeDigits(text: string): string {
  return text.replace(/\p{Nd}/gu, (ch) => {
    const code = ch.codePointAt(0)!;
    for (const zero of ZEROS) {
      if (code >= zero && code <= zero + 9) return String(code - zero);
    }
    return ch;
  });
}
