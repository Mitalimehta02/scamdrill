// The fixed 10-stage drill script. The app controls the pace; the AI only writes dialogue
// for the current beat. Every stage has a canned line in each language so the drill never breaks
// (prd.md > Drill Script and Pacing, prd.md > Resilience and Demo Mode, prd.md > Languages).
// Text uses placeholders ({PARENT}, {BANK}, ...) that are filled in only in the browser.
// Beats stay in English: they are instructions to the model, never shown to the parent.
// Hindi and Hinglish canned lines: reviewed by a native speaker (slice 5).

import type { Lang } from "../i18n/strings";
import type { Tactic } from "./tactics";

export type StageEvent = "otp" | "pay";

export interface Stage {
  /** Instruction for the AI: what this message must accomplish. */
  beat: string;
  /** Used when the classifier fails, is invalid, or is too slow. */
  plannedTactic: Tactic;
  /** Used when the scammer AI call fails, is refused, or is too slow — and always in demo mode. */
  cannedLine: Record<Lang, string>;
  /** Something the app shows when this stage begins. */
  event?: StageEvent;
  /** Placeholders the AI line must use, or the canned line is shown (keeps the drill personal in every language). */
  required?: string[];
}

/** Money only enters the conversation when the Pay card does (stage 7). */
export const PAY_STAGE = 7;

export const STAGE_COUNT = 10;

export const STAGES: Record<number, Stage> = {
  1: {
    beat: "Greet them warmly but officially (\"Namaste {PARENT} ji\"), introduce yourself as Inspector Sharma from the CBI Cyber Cell, Delhi, and say you are calling about a serious matter in their name.",
    plannedTactic: "AUTHORITY",
    cannedLine: {
      en: "Namaste {PARENT} ji, this is Inspector Sharma from the CBI Cyber Cell, Delhi. I am calling about a serious matter registered in your name.",
      hi: "नमस्ते {PARENT} जी, मैं दिल्ली सीबीआई साइबर सेल से इंस्पेक्टर शर्मा बोल रहा हूँ। आपके नाम पर एक गंभीर मामला दर्ज हुआ है।",
      hinglish: "Namaste {PARENT} ji, main CBI Cyber Cell, Delhi se Inspector Sharma bol raha hoon. Aapke naam par ek serious case register hua hai.",
    },
  },
  2: {
    beat: "Claim their Aadhaar has been linked to a money-laundering case involving an account at {BANK}.",
    plannedTactic: "AUTHORITY",
    required: ["BANK"],
    cannedLine: {
      en: "{PARENT} ji, your Aadhaar has been linked to a money-laundering case. Large amounts have moved through an account in your name at {BANK}.",
      hi: "{PARENT} जी, आपका आधार एक मनी-लॉन्ड्रिंग केस से जुड़ा पाया गया है। {BANK} में आपके नाम के खाते से बहुत बड़ी रकम का लेन-देन हुआ है।",
      hinglish: "{PARENT} ji, aapka Aadhaar ek money laundering case se juda paya gaya hai. {BANK} mein aapke naam ke account se bahut badi raqam ka transaction hua hai.",
    },
  },
  3: {
    beat: "Say an arrest warrant has already been issued in their name and they must act immediately to avoid arrest.",
    plannedTactic: "URGENCY",
    cannedLine: {
      en: "An arrest warrant has already been issued in your name. If you do not cooperate right now, the local police will come to your home today.",
      hi: "आपके नाम पर गिरफ़्तारी का वारंट जारी हो चुका है। अगर आपने अभी सहयोग नहीं किया, तो आज ही स्थानीय पुलिस आपके घर पहुँच जाएगी।",
      hinglish: "Aapke naam par arrest warrant jaari ho chuka hai. Agar aapne abhi cooperate nahi kiya, toh aaj hi local police aapke ghar aa jayegi.",
    },
  },
  4: {
    beat: "Tell them they are now under \"digital arrest\" (use those exact words), then insist the matter is confidential: they must not tell anyone, including family, and must stay on this call until verification is complete.",
    plannedTactic: "SECRECY",
    cannedLine: {
      en: "You are under digital arrest. This is a confidential matter of national security. Do not tell anyone, not even your family. Stay on this call until verification is complete.",
      hi: "आप अभी डिजिटल अरेस्ट में हैं। यह राष्ट्रीय सुरक्षा का गोपनीय मामला है। किसी को मत बताइए, अपने परिवार को भी नहीं। जाँच पूरी होने तक यह कॉल मत काटिए।",
      hinglish: "Aap abhi digital arrest mein hain. Yeh national security ka confidential matter hai. Kisi ko mat bataiye, apni family ko bhi nahi. Jaanch poori hone tak call mat kaatiye.",
    },
  },
  5: {
    beat: "Say a verification code has just been sent to their phone and demand they read it out to you now to stop the warrant.",
    plannedTactic: "OTP",
    cannedLine: {
      en: "We have just sent a verification code to your phone. Read the code to me now so I can confirm your identity and stop the warrant.",
      hi: "हमने अभी आपके फ़ोन पर एक वेरिफ़िकेशन कोड भेजा है। वह कोड मुझे अभी बताइए, ताकि मैं आपकी पहचान की पुष्टि करके वारंट रोक सकूँ।",
      hinglish: "Humne abhi aapke phone par ek verification code bheja hai. Woh code mujhe abhi bataiye, taaki main aapki pehchaan confirm karke warrant rok sakoon.",
    },
    event: "otp",
  },
  6: {
    beat: "Add pressure: their grandchild {GRANDCHILD} could also be questioned if they delay.",
    plannedTactic: "FEAR",
    required: ["GRANDCHILD"],
    cannedLine: {
      en: "If you delay, your grandchild {GRANDCHILD} may also be called for questioning. Family members are linked to this account.",
      hi: "अगर आपने देर की, तो {GRANDCHILD} को भी पूछताछ के लिए बुलाया जा सकता है। परिवार वाले भी इस खाते से जुड़े हैं।",
      hinglish: "Agar aapne der ki, toh {GRANDCHILD} ko bhi poochtaach ke liye bulaya ja sakta hai. Family wale bhi is account se jude hain.",
    },
  },
  7: {
    beat: "Tell them to transfer {AMOUNT} to the RBI safe account {ACCOUNT} shown on their screen to prove their innocence, and say it will be refunded after verification.",
    plannedTactic: "PAYMENT",
    required: ["AMOUNT"],
    cannedLine: {
      en: "To prove your innocence, transfer {AMOUNT} to the RBI safe account {ACCOUNT} shown on your screen. It will be refunded after verification.",
      hi: "अपनी बेगुनाही साबित करने के लिए स्क्रीन पर दिख रहे RBI सेफ़ अकाउंट {ACCOUNT} में {AMOUNT} ट्रांसफ़र कीजिए। जाँच के बाद यह रकम वापस कर दी जाएगी।",
      hinglish: "Apni begunahi saabit karne ke liye screen par dikh rahe RBI safe account {ACCOUNT} mein {AMOUNT} transfer kijiye. Verification ke baad paisa wapas mil jayega.",
    },
    event: "pay",
  },
  8: {
    beat: "Escalate urgency: every minute of delay makes the case worse. Push them to complete the transfer now.",
    plannedTactic: "URGENCY",
    cannedLine: {
      en: "Why are you hesitating, {PARENT} ji? Every minute you delay makes your case worse. Complete the transfer now.",
      hi: "{PARENT} जी, अब देर मत कीजिए। हर मिनट की देरी से आपका केस और बिगड़ रहा है। ट्रांसफ़र अभी पूरा कीजिए।",
      hinglish: "{PARENT} ji, ab der mat kijiye. Har minute ki deri se aapka case aur bigad raha hai. Transfer abhi poora kijiye.",
    },
  },
  9: {
    beat: "Isolate them: tell them not to disconnect or call anyone, especially {SAFE_CONTACT}, or that person will be named in the case too.",
    plannedTactic: "ISOLATION",
    required: ["SAFE_CONTACT"],
    cannedLine: {
      en: "Do not disconnect and do not call anyone. If you speak to {SAFE_CONTACT}, they will also be named in this case.",
      hi: "कॉल मत काटिए और किसी को फ़ोन मत कीजिए। अगर आपने {SAFE_CONTACT} से बात की, तो उनका नाम भी इस केस में जोड़ दिया जाएगा।",
      hinglish: "Call mat kaatiye aur kisi ko phone mat kijiye. Agar aapne {SAFE_CONTACT} se baat ki, toh unka naam bhi is case mein jod diya jayega.",
    },
  },
  10: {
    beat: "Final ultimatum: make the payment to the safe account now, or the arrest team will be sent.",
    plannedTactic: "PAYMENT",
    cannedLine: {
      en: "This is your final chance, {PARENT} ji. Make the payment to the safe account now, or the arrest team will be sent to your home.",
      hi: "{PARENT} जी, यह आपका आख़िरी मौका है। अभी सेफ़ अकाउंट में पेमेंट कीजिए, वरना गिरफ़्तारी टीम आपके घर भेज दी जाएगी।",
      hinglish: "{PARENT} ji, yeh aapka aakhri mauka hai. Abhi safe account mein payment kijiye, warna arrest team aapke ghar bhej di jayegi.",
    },
  },
};

export const NUDGE_BEAT =
  "The user has gone silent. Send one short line demanding they respond and not disconnect.";
export const NUDGE_LINE: Record<Lang, string> = {
  en: "Hello? {PARENT} ji, do not disconnect. This is a serious matter.",
  hi: "हैलो? {PARENT} जी, कॉल मत काटिए। यह बहुत गंभीर मामला है।",
  hinglish: "Hello? {PARENT} ji, call mat kaatiye. Yeh bahut serious matter hai.",
};
export const NUDGE_TACTIC: Tactic = "ISOLATION";
