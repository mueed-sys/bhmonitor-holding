// Pledge name normalization + server-side validation/moderation.
// The POST route is the only trusted gate — client checks are UX only.

import { BLOCKED_EXACT, PROFANITY, TITLE_WORDS } from "./blocklist";

export const NAME_MIN = 2;
export const NAME_MAX = 41; // fits the poster name slot

// Combining diacritics: Latin (NFD) combining marks + Arabic tashkeel/tatweel.
const DIACRITICS = /[̀-ͯؐ-ًؚ-ٰٟۖ-ۭـ]/g;

// Allowed characters for a *display* name: Arabic letters, Latin letters,
// spaces, hyphen, apostrophe variants, dot. Tashkeel is allowed (stripped for
// the normalized form). No digits, no symbols, no emoji.
const ALLOWED = /^[ء-يٱ-ۓؐ-ًؚ-ٰٟۖ-ۭـA-Za-z \-'’ʼ.]+$/;

/**
 * Display name cleanup: trim + collapse internal whitespace. Preserves the
 * original script/casing/diacritics for showing on the wall.
 */
export function cleanDisplayName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * Normalized form used for search + dedupe + moderation matching:
 * collapse whitespace, lowercase, strip diacritics/tashkeel, normalize
 * Arabic alef/yaa/taa-marbuta variants and apostrophes.
 */
export function normalizeName(raw: string): string {
  return cleanDisplayName(raw)
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[إأآاٱٲٳ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/['’ʼ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Filler words ignored when deciding whether a name is "titles only", so
// "the king" / "the sultan" are caught, not just a bare "king".
const STOPWORDS = new Set(["the", "a", "an", "of", "al", "el"]);

/**
 * True when a normalized name consists ONLY of honorifics/titles (ignoring
 * filler words) — e.g. "the king", "الشيخ". A real name that merely contains a
 * title as a surname ("عبدالله الشيخ") is NOT title-only.
 */
function isTitleOnly(normalized: string): boolean {
  const meaningful = normalized.split(" ").filter((tok) => tok && !STOPWORDS.has(tok));
  return meaningful.length > 0 && meaningful.every((tok) => TITLE_WORDS.includes(tok));
}

export interface ValidationResult {
  ok: boolean;
  /** Bilingual, ready to show to the user. */
  message?: string;
}

const INVALID = (message: string): ValidationResult => ({ ok: false, message });

/**
 * Validate a display name. Returns the cleaned display name + normalized name
 * on success so the caller doesn't recompute them.
 */
export function validateName(raw: unknown): ValidationResult & { display?: string; normalized?: string } {
  if (typeof raw !== "string") return INVALID("الاسم مطلوب · Name is required");

  const display = cleanDisplayName(raw);

  if (display.length < NAME_MIN) {
    return INVALID("الاسم قصير جداً · Name is too short");
  }
  if (display.length > NAME_MAX) {
    return INVALID("الاسم طويل جداً · Name is too long");
  }
  if (/[0-9٠-٩۰-۹]/.test(display)) {
    return INVALID("لا يُسمح بالأرقام في الاسم · Numbers are not allowed");
  }
  if (!ALLOWED.test(display)) {
    return INVALID("يحتوي الاسم على رموز غير مسموح بها · Name contains invalid characters");
  }
  // Must contain at least one actual letter (not only punctuation/spaces).
  if (!/[ء-يٱ-ۓA-Za-z]/.test(display)) {
    return INVALID("الرجاء إدخال اسم صحيح · Please enter a valid name");
  }
  // Repeated-character spam: same letter 4+ times in a row.
  if (/(.)\1{3,}/.test(display)) {
    return INVALID("الرجاء إدخال اسم صحيح · Please enter a valid name");
  }

  const normalized = normalizeName(display);
  if (normalized.length < NAME_MIN) {
    return INVALID("الرجاء إدخال اسم صحيح · Please enter a valid name");
  }

  // Too few distinct characters overall → spam (e.g. "a a a a").
  if (new Set(normalized.replace(/\s/g, "")).size < 2) {
    return INVALID("الرجاء إدخال اسم صحيح · Please enter a valid name");
  }

  // Exact blocked phrases.
  if (BLOCKED_EXACT.includes(normalized)) {
    return INVALID("هذا الاسم غير مقبول · This name is not accepted");
  }

  // Profanity (substring on normalized, ignoring spaces too).
  const compact = normalized.replace(/\s/g, "");
  for (const bad of PROFANITY) {
    if (normalized.includes(bad) || compact.includes(bad)) {
      return INVALID("هذا الاسم غير مقبول · This name is not accepted");
    }
  }

  // Title-only names (every meaningful token is an honorific/official title).
  if (isTitleOnly(normalized)) {
    return INVALID("الرجاء إدخال اسمك الحقيقي · Please use your real name");
  }

  return { ok: true, display, normalized };
}

/**
 * Read-time moderation gate for the PUBLIC wall. Defense-in-depth: every name
 * is already screened by validateName() at submit time, but the blocklist
 * grows over time. This re-checks a stored (already-normalized) name so any
 * entry that predates a blocklist update is hidden from the public wall even
 * while it stays `active` in the database. Pure + boolean — easy to unit-test.
 *
 * Pass the NORMALIZED name (normalizeName() output). Returns false to hide.
 */
export function isCleanName(normalized: string): boolean {
  if (!normalized) return false;

  if (BLOCKED_EXACT.includes(normalized)) return false;

  const compact = normalized.replace(/\s/g, "");
  for (const bad of PROFANITY) {
    if (normalized.includes(bad) || compact.includes(bad)) return false;
  }

  // Title-only names ("the king", "الشيخ") never belong on the public wall.
  if (isTitleOnly(normalized)) return false;

  return true;
}

/**
 * Validate a Bahrain phone number. Accepts the 8 local digits, tolerating a
 * leading +973 / 00973 / 973 and any spaces/dashes the user typed. Returns the
 * normalized 8-digit string (no country code) — stored privately, never shown.
 */
export function validatePhone(raw: unknown): ValidationResult & { value?: string } {
  if (typeof raw !== "string") {
    return INVALID("رقم الهاتف مطلوب · Phone number is required");
  }
  // Map Arabic-Indic digits to ASCII, then keep digits only.
  let digits = raw
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/\D/g, "");

  // Strip a leading Bahrain country code if present.
  if (digits.length === 11 && digits.startsWith("973")) digits = digits.slice(3);
  else if (digits.length === 13 && digits.startsWith("00973")) digits = digits.slice(5);

  if (!/^[0-9]{8}$/.test(digits)) {
    return INVALID("أدخل رقم هاتف صحيح مكوّن من ٨ أرقام · Enter a valid 8-digit phone number");
  }
  return { ok: true, value: digits };
}
