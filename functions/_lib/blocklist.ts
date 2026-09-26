// Moderation lists for the pledge wall. EDIT THIS FILE to tune moderation.
//
// All matching runs against the NORMALIZED name (trimmed, whitespace-collapsed,
// lowercased, diacritics + Arabic tashkeel stripped) — see normalizeName() in
// pledge.ts. Keep entries lowercase and diacritic-free so they match.
//
// Three lists:
//   PROFANITY    — substring match anywhere in the name → blocked.
//   TITLE_WORDS  — honorifics / official titles. A name made up ENTIRELY of
//                  these tokens is blocked (e.g. "king", "الشيخ"). A real name
//                  that merely contains one (e.g. "عبدالله الشيخ" as a surname)
//                  is allowed.
//   BLOCKED_EXACT — full-name phrases blocked on an exact normalized match.

// ── Profanity (substring) — Arabic + English ────────────────────────────────
export const PROFANITY: string[] = [
  // English
  "fuck", "fuk", "phuck", "fuckk", "motherf", "shit", "bitch", "cunt",
  "asshole", "bastard", "dick", "pussy", "cock", "cocksuck", "slut", "whore",
  "nigger", "nigga", "faggot", "retard", "wanker", "twat", "jackass",
  "dumbass", "douche", "porn", "rape", "molest", "pedo",
  // Arabic
  "خرا", "خرة", "خرى", "كس", "كسم", "كسمك", "زب", "طيز", "عرص", "شرموط",
  "شرموطة", "شرموطه", "قحبة", "قحبه", "منيوك", "متناك", "خول", "نياك",
  "نيك", "عاهرة", "عاهره", "لوطي", "لعنة", "يلعن", "ملعون", "كافر", "نجس",
];

// ── Titles / honorifics (token-level) — Arabic + English ─────────────────────
// Blocked only when they make up the WHOLE name.
export const TITLE_WORDS: string[] = [
  // English
  "king", "queen", "prince", "princess", "sheikh", "sheik", "shaikh",
  "majesty", "highness", "royal", "president", "minister", "sir", "lord",
  "sultan", "emir", "amir", "excellency", "honorable", "hrh", "hm",
  // Arabic
  "ملك", "الملك", "ملكة", "الملكة", "امير", "الامير", "اميرة",
  "شيخ", "الشيخ", "شيخة", "سمو", "السمو", "جلالة", "الجلالة",
  "صاحب", "رئيس", "الرئيس", "وزير", "الوزير", "سيدي", "مولاي",
  "سلطان", "السلطان", "معالي", "سعادة",
];

// ── Exact full-name phrases ──────────────────────────────────────────────────
// NOTE: entries are matched against the NORMALIZED name, so they must be
// written in normalized form too (taa-marbuta ة → ه, alef variants → ا, etc.).
export const BLOCKED_EXACT: string[] = [
  "صاحب الجلاله",
  "صاحب السمو",
  "his majesty",
  "his highness",
  "your majesty",
  "test test",
  "asdf asdf",
];
