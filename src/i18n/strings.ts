// Every visible string, in English, हिन्दी and Hinglish (spec.md > Strings Dictionary). No i18n library.
// Safety text (tips, win facts, the 1930 card) is written by us, never by the AI.
// Hindi and Hinglish: NEEDS NATIVE REVIEW (see devpost/checklist.md, slice 5).

import type { EndReason } from "../drill/reducer";
import type { Tactic } from "../drill/tactics";

export type Lang = "en" | "hi" | "hinglish";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी (Hindi)" },
  { id: "hinglish", label: "Hinglish" },
];

// The same in every language, so it can never be mistranslated.
export const HELPLINE = "1930";
export const REPORT_SITE = "cybercrime.gov.in";
export const OTP_SENDER = "BANK-OTP";

export interface Strings {
  htmlLang: string;
  /** For timestamps. */
  locale: string;
  strip: string;
  demoNote: string;
  setup: {
    title: string;
    lede: string;
    demoButton: string;
    yourName: string;
    parentName: string;
    parentHint: string;
    bank: string;
    grandchild: string;
    safeContact: string;
    relation: string;
    relationPlaceholder: string;
    language: string;
    note: string;
    handTo: (name: string) => string;
    yourParent: string;
    examples: { child: string; parent: string; bank: string; grandchild: string; safeContact: string };
    /** The relation filled in by "Use demo details", in this language. */
    demoRelation: string;
  };
  handoff: {
    greeting: (parent: string) => string;
    setBy: (child: string) => string;
    reassureStrong: string;
    reassureRest: string;
    start: string;
  };
  drill: {
    caller: string;
    callerSub: string;
    typing: string;
    onCall: string;
    pressure: string;
    incoming: string;
    hangUp: string;
    call: (label: string) => string;
    reply: string;
    replyWaiting: string;
    send: string;
    offline: string;
  };
  otp: { now: string; body: string; pill: string };
  pay: { title: string; account: string; amount: string; pay: (amount: string) => string; fine: string };
  tactics: Record<Tactic, { name: string; explanation: string; tip: string }>;
  ending: {
    winHangup: string;
    winCall: (label: string) => string;
    right: string;
    facts: [string, string, string];
    lossTitle: string;
    lossLede: string;
    sensitive: string;
    partialTitle: string;
    partialLede: (messages: number) => string;
    realLifeTitle: string;
    /** Rendered as: {before} 1930 ({helplineName}) {middle} cybercrime.gov.in{after} */
    realLife: { before: string; helplineName: string; middle: string; after: string };
    handBack: (child: string) => string;
    family: string;
  };
  report: {
    title: string;
    forParent: (parent: string) => string;
    outcome: { win: string; loss: string; partial: string };
    instantOne: string;
    instantZero: string;
    labels: Record<Exclude<EndReason, "call">, string>;
    called: (label: string) => string;
    onLine: string;
    scammerMessages: string;
    tactics: string;
    greyNote: string;
    moment: string;
    tipTitle: string;
    again: string;
    fallbackTips: { win: string; loss: string; partial: string };
  };
}

const en: Strings = {
  htmlLang: "en",
  locale: "en-IN",
  strip: "TRAINING DRILL – not a real call",
  demoNote: "Demo mode: scripted lines",
  setup: {
    title: "Set up a practice drill",
    lede: "Your parent will practise a fake \"digital arrest\" call on this phone. These details make it feel real.",
    demoButton: "Use demo details",
    yourName: "Your name",
    parentName: "Parent's name",
    parentHint: "what the caller will call them",
    bank: "Their bank",
    grandchild: "A grandchild's name",
    safeContact: "Safe contact",
    relation: "Relation",
    relationPlaceholder: "optional",
    language: "Language",
    note: "Use first names only. ScamDrill never asks for real account numbers, OTPs or ID numbers, and stores nothing.",
    handTo: (name) => `Hand to ${name}`,
    yourParent: "your parent",
    examples: { child: "e.g. Anjali", parent: "e.g. Kamala", bank: "e.g. SBI, HDFC", grandchild: "e.g. Aarav", safeContact: "e.g. Rahul" },
    demoRelation: "son",
  },
  handoff: {
    greeting: (p) => `Namaste, ${p} ji`,
    setBy: (c) => `${c} has set up a practice drill for you.`,
    reassureStrong: "This is only practice.",
    reassureRest:
      "Nobody real is calling. Someone pretending to be an officer will message you. Your job is to spot the tricks and hang up or call family.",
    start: "Start practice",
  },
  drill: {
    caller: "Inspector Sharma",
    callerSub: "CBI Cyber Cell",
    typing: "typing…",
    onCall: "On call",
    pressure: "Pressure",
    incoming: "Incoming call · CBI Cyber Cell, Delhi",
    hangUp: "Hang up",
    call: (l) => `Call ${l}`,
    reply: "Type a reply…",
    replyWaiting: "Inspector Sharma is typing…",
    send: "Send",
    offline: "Running in offline practice mode",
  },
  otp: { now: "now", body: "is your OTP for account verification. Do not share it with anyone.", pill: `New message · ${OTP_SENDER}` },
  pay: {
    title: "RBI Safe Account",
    account: "Account",
    amount: "Amount",
    pay: (a) => `Pay ${a}`,
    fine: "Fictional account for practice. No money moves.",
  },
  tactics: {
    AUTHORITY: {
      name: "AUTHORITY",
      explanation: "Claims to be police or CBI. Real officers never investigate anyone over a call.",
      tip: "Practise saying \"I will call the police station myself\" and hanging up. A real officer won't mind.",
    },
    FEAR: {
      name: "FEAR",
      explanation: "Scary news about you or your family makes it hard to think clearly.",
      tip: "Agree together: frightening news on a call is a signal to hang up and call family, not to act.",
    },
    URGENCY: {
      name: "URGENCY",
      explanation: "Rushing you. Real legal processes never demand action within minutes.",
      tip: "Make a family rule: any call that says \"act now\" gets a hang-up and a call to family first.",
    },
    SECRECY: {
      name: "SECRECY",
      explanation: "\"Don't tell your family\" is there so no one can warn you.",
      tip: "Make it a family rule: anyone who says \"don't tell your family\" is a scammer.",
    },
    ISOLATION: {
      name: "ISOLATION",
      explanation: "Keeping you on the line so you can't pause, check, or call someone.",
      tip: "Practise hanging up mid-sentence. It isn't rude when someone is pressuring you.",
    },
    OTP: {
      name: "OTP",
      explanation: "Asking for the code sent to your phone. No official ever needs your OTP.",
      tip: "Put a note by the phone: \"Never read out an OTP — not to the bank, police, or anyone.\"",
    },
    PAYMENT: {
      name: "PAYMENT",
      explanation: "A \"safe account\" doesn't exist. No agency asks you to move money.",
      tip: "Agree together: no money moves after a phone call without talking to family first.",
    },
  },
  ending: {
    winHangup: "You hung up.",
    winCall: (l) => `You called ${l}.`,
    right: "That's exactly right.",
    facts: [
      "Real police or CBI never arrest anyone over a call.",
      "\"Digital arrest\" doesn't exist in Indian law.",
      "No official ever asks for your OTP.",
    ],
    lossTitle: "This is how it happens to careful people.",
    lossLede: "Here's the moment:",
    sensitive: "Please never type real details, even in practice. In a real call, this is exactly what they want.",
    partialTitle: "You didn't give anything away.",
    partialLede: (n) => `But you stayed on the line for ${n} messages. Next time, hang up at the first threat.`,
    realLifeTitle: "In real life",
    realLife: { before: "Hang up, then call", helplineName: "National Cyber Crime Helpline", middle: "or report at", after: "." },
    handBack: (c) => `Hand back to ${c}`,
    family: "your family",
  },
  report: {
    title: "Report card",
    forParent: (p) => `${p}'s practice drill`,
    outcome: { win: "Ended the call in time", loss: "Got caught out this time", partial: "Stayed on the line" },
    instantOne: "Instant reflex: ended the call after 1 message",
    instantZero: "Instant reflex: ended the call straight away",
    labels: {
      hangup: "Hung up",
      otp: "Shared the OTP",
      sensitive: "Tried to share a code or personal number",
      pay: "Sent money",
      stayed: "Stayed on the line too long",
    },
    called: (l) => `Called ${l}`,
    onLine: "on the line",
    scammerMessages: "scammer messages",
    tactics: "Tactics",
    greyNote: "Greyed out: the scammer never got to use these.",
    moment: "The moment",
    tipTitle: "Practise next time",
    again: "Run another drill",
    fallbackTips: {
      win: "Keep practising together: the reflex to hang up gets faster every time.",
      loss: "Run the drill again soon. Recognising the moment is a skill that grows with practice.",
      partial: "Practise hanging up at the very first threat. You never owe a caller your time.",
    },
  },
};

const hi: Strings = {
  htmlLang: "hi",
  locale: "hi-IN",
  strip: "ट्रेनिंग ड्रिल – यह असली कॉल नहीं है",
  demoNote: "डेमो मोड: पहले से लिखी लाइनें",
  setup: {
    title: "प्रैक्टिस ड्रिल तैयार करें",
    lede: "आपके माता/पिता इस फ़ोन पर एक नकली “डिजिटल अरेस्ट” कॉल का अभ्यास करेंगे। ये जानकारियाँ इसे असली जैसा बनाती हैं।",
    demoButton: "डेमो जानकारी भरें",
    yourName: "आपका नाम",
    parentName: "माता/पिता का नाम",
    parentHint: "कॉल करने वाला इन्हें इसी नाम से बुलाएगा",
    bank: "उनका बैंक",
    grandchild: "किसी पोते-पोती का नाम",
    safeContact: "भरोसेमंद संपर्क",
    relation: "रिश्ता",
    relationPlaceholder: "वैकल्पिक",
    language: "भाषा",
    note: "सिर्फ़ पहले नाम लिखें। ScamDrill कभी असली खाता नंबर, OTP या पहचान नंबर नहीं माँगता, और कुछ भी सेव नहीं करता।",
    handTo: (name) => `${name} को फ़ोन दें`,
    yourParent: "माता/पिता",
    examples: { child: "जैसे Anjali", parent: "जैसे Kamala", bank: "जैसे SBI, HDFC", grandchild: "जैसे Aarav", safeContact: "जैसे Rahul" },
    demoRelation: "बेटा",
  },
  handoff: {
    greeting: (p) => `नमस्ते, ${p} जी`,
    setBy: (c) => `${c} ने आपके लिए एक प्रैक्टिस ड्रिल तैयार की है।`,
    reassureStrong: "यह सिर्फ़ अभ्यास है।",
    reassureRest:
      "कोई असली व्यक्ति कॉल नहीं कर रहा। कोई अफ़सर बनकर आपको संदेश भेजेगा। आपको उसकी चालें पहचाननी हैं और फ़ोन काटना है या परिवार को फ़ोन करना है।",
    start: "अभ्यास शुरू करें",
  },
  drill: {
    caller: "इंस्पेक्टर शर्मा",
    callerSub: "सीबीआई साइबर सेल",
    typing: "टाइप कर रहे हैं…",
    onCall: "कॉल पर",
    pressure: "दबाव",
    incoming: "इनकमिंग कॉल · सीबीआई साइबर सेल, दिल्ली",
    hangUp: "फ़ोन काटें",
    call: (l) => `${l} को कॉल करें`,
    reply: "जवाब लिखें…",
    replyWaiting: "इंस्पेक्टर शर्मा टाइप कर रहे हैं…",
    send: "भेजें",
    offline: "ऑफ़लाइन प्रैक्टिस मोड चल रहा है",
  },
  otp: { now: "अभी", body: "आपके खाते के वेरिफ़िकेशन का OTP है। इसे किसी के साथ साझा न करें।", pill: `नया संदेश · ${OTP_SENDER}` },
  pay: {
    title: "RBI सेफ़ अकाउंट",
    account: "खाता",
    amount: "रकम",
    pay: (a) => `${a} भेजें`,
    fine: "अभ्यास के लिए काल्पनिक खाता। कोई पैसा नहीं जाता।",
  },
  tactics: {
    AUTHORITY: {
      name: "रौब / अधिकार",
      explanation: "पुलिस या सीबीआई होने का दावा। असली अफ़सर कभी फ़ोन पर जाँच नहीं करते।",
      tip: "अभ्यास करें: “मैं ख़ुद थाने फ़ोन करूँगा/करूँगी” कहकर फ़ोन काट देना। असली अफ़सर बुरा नहीं मानेगा।",
    },
    FEAR: {
      name: "डर",
      explanation: "आपको या परिवार को डराने वाली बात, ताकि आप ठीक से सोच न सकें।",
      tip: "मिलकर तय करें: फ़ोन पर डरावनी ख़बर का मतलब है — फ़ोन काटो और परिवार को फ़ोन करो।",
    },
    URGENCY: {
      name: "जल्दबाज़ी",
      explanation: "जल्दबाज़ी करवाना। असली क़ानूनी प्रक्रिया मिनटों में कुछ करने को नहीं कहती।",
      tip: "परिवार का नियम बनाएँ: जो कॉल “अभी करो” कहे, उसे काटो और पहले परिवार से बात करो।",
    },
    SECRECY: {
      name: "राज़ रखना",
      explanation: "“परिवार को मत बताना” इसलिए कहा जाता है, ताकि कोई आपको सावधान न कर सके।",
      tip: "परिवार का नियम बनाएँ: जो कहे “परिवार को मत बताना”, वह ठग है।",
    },
    ISOLATION: {
      name: "अकेला करना",
      explanation: "आपको कॉल पर रोके रखना, ताकि आप रुककर जाँच न कर सकें या किसी को फ़ोन न कर सकें।",
      tip: "बात के बीच में फ़ोन काटने का अभ्यास करें। दबाव डालने वाले का फ़ोन काटना बदतमीज़ी नहीं है।",
    },
    OTP: {
      name: "OTP माँगना",
      explanation: "फ़ोन पर आया कोड माँगना। कोई भी अधिकारी कभी आपका OTP नहीं माँगता।",
      tip: "फ़ोन के पास पर्ची लगाएँ: “OTP कभी मत बताओ — न बैंक को, न पुलिस को, न किसी को।”",
    },
    PAYMENT: {
      name: "पैसे माँगना",
      explanation: "“सेफ़ अकाउंट” जैसी कोई चीज़ नहीं होती। कोई भी एजेंसी पैसे ट्रांसफ़र करने को नहीं कहती।",
      tip: "मिलकर तय करें: किसी फ़ोन कॉल के बाद, परिवार से बात किए बिना कोई पैसा नहीं भेजा जाएगा।",
    },
  },
  ending: {
    winHangup: "आपने फ़ोन काट दिया।",
    winCall: (l) => `आपने ${l} को फ़ोन किया।`,
    right: "बिल्कुल सही किया।",
    facts: [
      "असली पुलिस या सीबीआई कभी फ़ोन कॉल पर किसी को गिरफ़्तार नहीं करती।",
      "भारतीय क़ानून में “डिजिटल अरेस्ट” जैसी कोई चीज़ नहीं है।",
      "कोई भी सरकारी अधिकारी कभी आपका OTP नहीं माँगता।",
    ],
    lossTitle: "सावधान लोगों के साथ भी ऐसा ही होता है।",
    lossLede: "यह रहा वह पल:",
    sensitive: "कृपया अभ्यास में भी कभी असली जानकारी न लिखें। असली कॉल में ठग यही चाहते हैं।",
    partialTitle: "आपने कुछ नहीं बताया।",
    partialLede: (n) => `लेकिन कॉल ${n} संदेशों तक चलती रही। अगली बार पहली धमकी पर ही फ़ोन काट दें।`,
    realLifeTitle: "असल ज़िंदगी में",
    realLife: { before: "फ़ोन काटें, फिर", helplineName: "राष्ट्रीय साइबर अपराध हेल्पलाइन", middle: "पर कॉल करें या", after: " पर शिकायत करें।" },
    handBack: (c) => `${c} को वापस दें`,
    family: "परिवार",
  },
  report: {
    title: "रिपोर्ट कार्ड",
    forParent: (p) => `${p} जी की प्रैक्टिस ड्रिल`,
    outcome: { win: "समय पर कॉल ख़त्म की", loss: "इस बार चूक हो गई", partial: "कॉल लंबी चली" },
    instantOne: "तुरंत प्रतिक्रिया: 1 संदेश के बाद ही कॉल ख़त्म",
    instantZero: "तुरंत प्रतिक्रिया: फ़ौरन कॉल ख़त्म",
    labels: {
      hangup: "फ़ोन काटा",
      otp: "OTP बता दिया",
      sensitive: "कोड या निजी नंबर बताने की कोशिश की",
      pay: "पैसे भेज दिए",
      stayed: "बहुत देर तक कॉल पर रहना",
    },
    called: (l) => `${l} को फ़ोन किया`,
    onLine: "कॉल पर समय",
    scammerMessages: "ठग के संदेश",
    tactics: "तरीके",
    greyNote: "धुंधले वाले: ठग इन्हें इस्तेमाल ही नहीं कर पाया।",
    moment: "वह पल",
    tipTitle: "अगली बार इसका अभ्यास करें",
    again: "एक और ड्रिल करें",
    fallbackTips: {
      win: "साथ में अभ्यास करते रहें: हर बार फ़ोन काटने की आदत और पक्की होती है।",
      loss: "जल्दी ही ड्रिल फिर से करें। उस पल को पहचानना अभ्यास से आता है।",
      partial: "पहली धमकी पर ही फ़ोन काटने का अभ्यास करें। किसी कॉल करने वाले को आपका समय देना ज़रूरी नहीं।",
    },
  },
};

const hinglish: Strings = {
  htmlLang: "hi-Latn",
  locale: "en-IN",
  strip: "TRAINING DRILL – yeh asli call nahi hai",
  demoNote: "Demo mode: pehle se likhi lines",
  setup: {
    title: "Practice drill set karein",
    lede: "Aapke parent is phone par ek nakli \"digital arrest\" call ki practice karenge. Yeh details ise asli jaisa banati hain.",
    demoButton: "Demo details bharein",
    yourName: "Aapka naam",
    parentName: "Parent ka naam",
    parentHint: "caller inhe isi naam se bulayega",
    bank: "Unka bank",
    grandchild: "Kisi grandchild ka naam",
    safeContact: "Bharosemand contact",
    relation: "Rishta",
    relationPlaceholder: "optional",
    language: "Bhasha",
    note: "Sirf first name likhein. ScamDrill kabhi asli account number, OTP ya ID number nahi maangta, aur kuch save nahi karta.",
    handTo: (name) => `${name} ko phone dijiye`,
    yourParent: "parent",
    examples: { child: "jaise Anjali", parent: "jaise Kamala", bank: "jaise SBI, HDFC", grandchild: "jaise Aarav", safeContact: "jaise Rahul" },
    demoRelation: "beta",
  },
  handoff: {
    greeting: (p) => `Namaste, ${p} ji`,
    setBy: (c) => `${c} ne aapke liye ek practice drill set ki hai.`,
    reassureStrong: "Yeh sirf practice hai.",
    reassureRest:
      "Koi asli insaan call nahi kar raha. Koi officer ban kar aapko message karega. Aapko uski chaalein pehchaan kar phone kaatna hai ya family ko call karna hai.",
    start: "Practice shuru karein",
  },
  drill: {
    caller: "Inspector Sharma",
    callerSub: "CBI Cyber Cell",
    typing: "type kar rahe hain…",
    onCall: "Call par",
    pressure: "Dabaav",
    incoming: "Incoming call · CBI Cyber Cell, Delhi",
    hangUp: "Phone kaatein",
    call: (l) => `${l} ko call karein`,
    reply: "Jawab likhein…",
    replyWaiting: "Inspector Sharma type kar rahe hain…",
    send: "Bhejein",
    offline: "Offline practice mode chal raha hai",
  },
  otp: { now: "abhi", body: "aapke account verification ka OTP hai. Ise kisi ke saath share na karein.", pill: `Naya message · ${OTP_SENDER}` },
  pay: {
    title: "RBI Safe Account",
    account: "Account",
    amount: "Amount",
    pay: (a) => `${a} bhejein`,
    fine: "Practice ke liye nakli account. Koi paisa nahi jaata.",
  },
  tactics: {
    AUTHORITY: {
      name: "AUTHORITY (rob)",
      explanation: "Police ya CBI hone ka daawa. Asli officer kabhi phone par investigation nahi karte.",
      tip: "Practice karein: \"Main khud police station phone karunga/karungi\" bolkar phone kaat dena. Asli officer bura nahi maanega.",
    },
    FEAR: {
      name: "FEAR (darr)",
      explanation: "Aapko ya family ko darane wali baat, taaki aap theek se soch na sakein.",
      tip: "Milkar tay karein: phone par daraane wali khabar ka matlab hai — phone kaato aur family ko call karo.",
    },
    URGENCY: {
      name: "URGENCY (jaldbazi)",
      explanation: "Jaldbazi karwana. Asli legal process minuton mein kuch karne ko nahi kehta.",
      tip: "Family rule banayein: jo call \"abhi karo\" bole, use kaato aur pehle family se baat karo.",
    },
    SECRECY: {
      name: "SECRECY (raaz)",
      explanation: "\"Family ko mat batana\" isliye kaha jaata hai, taaki koi aapko warn na kar sake.",
      tip: "Family rule banayein: jo bole \"family ko mat batana\", woh thug hai.",
    },
    ISOLATION: {
      name: "ISOLATION (akela karna)",
      explanation: "Aapko call par roke rakhna, taaki aap ruk kar check na kar sakein ya kisi ko phone na kar sakein.",
      tip: "Baat ke beech mein phone kaatne ki practice karein. Dabaav daalne wale ka phone kaatna badtameezi nahi hai.",
    },
    OTP: {
      name: "OTP",
      explanation: "Phone par aaya code maangna. Koi bhi officer kabhi aapka OTP nahi maangta.",
      tip: "Phone ke paas parchi lagayein: \"OTP kabhi mat batao — na bank ko, na police ko, na kisi ko.\"",
    },
    PAYMENT: {
      name: "PAYMENT (paisa)",
      explanation: "\"Safe account\" jaisa kuch nahi hota. Koi agency paise transfer karne ko nahi kehti.",
      tip: "Milkar tay karein: kisi phone call ke baad, family se baat kiye bina koi paisa nahi jayega.",
    },
  },
  ending: {
    winHangup: "Aapne phone kaat diya.",
    winCall: (l) => `Aapne ${l} ko phone kiya.`,
    right: "Bilkul sahi kiya.",
    facts: [
      "Asli police ya CBI kabhi phone call par kisi ko arrest nahi karti.",
      "Indian law mein \"digital arrest\" jaisi koi cheez nahi hai.",
      "Koi bhi sarkari officer kabhi aapka OTP nahi maangta.",
    ],
    lossTitle: "Saavdhaan logon ke saath bhi aisa hi hota hai.",
    lossLede: "Yeh raha woh pal:",
    sensitive: "Please practice mein bhi kabhi asli details na likhein. Asli call mein thug yahi chahte hain.",
    partialTitle: "Aapne kuch nahi bataya.",
    partialLede: (n) => `Lekin call ${n} messages tak chalti rahi. Agli baar pehli dhamki par hi phone kaat dein.`,
    realLifeTitle: "Asli zindagi mein",
    realLife: { before: "Phone kaatiye, phir", helplineName: "National Cyber Crime Helpline", middle: "par call kijiye ya", after: " par complaint kijiye." },
    handBack: (c) => `${c} ko wapas dijiye`,
    family: "family",
  },
  report: {
    title: "Report card",
    forParent: (p) => `${p} ji ki practice drill`,
    outcome: { win: "Time par call khatam ki", loss: "Is baar chook ho gayi", partial: "Call lambi chali" },
    instantOne: "Instant reflex: 1 message ke baad hi call khatam",
    instantZero: "Instant reflex: turant call khatam",
    labels: {
      hangup: "Phone kaata",
      otp: "OTP bata diya",
      sensitive: "Code ya personal number batane ki koshish ki",
      pay: "Paise bhej diye",
      stayed: "Bahut der tak call par rehna",
    },
    called: (l) => `${l} ko phone kiya`,
    onLine: "call par samay",
    scammerMessages: "scammer ke messages",
    tactics: "Tareeke",
    greyNote: "Dhundhle wale: scammer inka istemaal hi nahi kar paaya.",
    moment: "Woh pal",
    tipTitle: "Agli baar iski practice karein",
    again: "Ek aur drill karein",
    fallbackTips: {
      win: "Saath mein practice karte rahiye: har baar phone kaatne ki aadat aur pakki hoti hai.",
      loss: "Jaldi hi drill phir se karein. Us pal ko pehchaanna practice se aata hai.",
      partial: "Pehli dhamki par hi phone kaatne ki practice karein. Kisi caller ko aapka time dena zaroori nahi.",
    },
  },
};

export const STRINGS: Record<Lang, Strings> = { en, hi, hinglish };
