import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Loader2, Download, ShieldCheck, CheckCircle2, BadgeCheck, SearchCheck, Share2, Users } from "lucide-react";
import { SiWhatsapp, SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";

/* ──────────────────────────────────────────────────────────────────────────
 * Poster / name-slot configuration.
 * Background artwork lives at /public/pledge/poster-base.jpg (1242×2225, a
 * web-sized copy of the supplied poster). The name is composited into the
 * blank slot between "…والتقدير إلى" and "لمشاركتكم…". The live preview and the
 * generated image both derive from these numbers, so they stay in sync.
 * ────────────────────────────────────────────────────────────────────────── */
const POSTER_SRC = "/pledge/poster-base.jpg";
const POSTER_W = 1242; // width of poster-base.jpg
const POSTER_H = 2225; // height (matches the supplied 3072×5504 ratio)
const NAME_CENTER_X = 0.5; // horizontal centre, fraction of width
const NAME_BASELINE_Y = 0.78; // vertical centre of the name slot, fraction of height
const NAME_MAX_WIDTH = 0.8; // name never exceeds this fraction of width
const NAME_FONT_PX = 108; // max font at poster resolution
const NAME_MIN_PX = 34; // shrink-to-fit floor — low enough that 41 chars fit one line
const NAME_COLOR = "#C9A227"; // ceremonial gold — slightly brighter for the dark canvas
// Poster name faces, chosen per name by posterFace(): Arabic uses Noto Kufi —
// bold, modern, and vertically compact so its letters never touch the line
// above; English keeps Amiri's elegant serif. (This affects ONLY the poster
// name — the rest of the page still uses Amiri for Arabic.)
const POSTER_AR_FONT = "'Noto Kufi Arabic', sans-serif";
const POSTER_EN_FONT = "'Amiri', serif";
function posterFace(name: string): { font: string; weight: number; maxPx: number } {
  return /[؀-ۿ]/.test(name)
    ? { font: POSTER_AR_FONT, weight: 800, maxPx: 92 }
    : { font: POSTER_EN_FONT, weight: 700, maxPx: NAME_FONT_PX };
}
// Page typography: refined sans for Latin, Amiri for every Arabic glyph (per-glyph
// fallback means Arabic names typed in EN mode still render in Amiri).
const UI_FONT = "'DM Sans', 'Amiri', sans-serif";
const ARABIC_FONT = "'Amiri', serif";
const EXPORT_TYPE = "image/jpeg";
const EXPORT_QUALITY = 0.95;

type PageLang = "ar" | "en";

// Bilingual copy. Names can be entered in either script regardless of UI lang.
const COPY = {
  heading: { ar: "وثيقة الولاء والتأييد", en: "Pledge of Loyalty & Support" },
  intro: {
    ar: "وقّع باسمك وانضم إلى قائمة المشاركين عبر منصة BHmonitor.",
    en: "Sign with your name and join the participants on the BHmonitor platform.",
  },
  counterLabel: {
    ar: "مشارك في وثيقة الولاء والتأييد",
    en: "participants in the Pledge of Loyalty & Support",
  },
  viewWall: { ar: "عرض جدار المشاركين ←", en: "View the wall of participants →" },
  aboutLink: { ar: "عن الوثيقة · الأسئلة الشائعة", en: "About the pledge · FAQ" },
  posterPlaceholder: { ar: "اسمك هنا", en: "Your name here" },
  nameLabel: { ar: "الاسم الكامل", en: "Full name" },
  namePlaceholder: { ar: "اكتب اسمك بالعربية أو الإنجليزية", en: "Type your name in Arabic or English" },
  phoneLabel: { ar: "رقم الهاتف", en: "Phone number" },
  phonePlaceholder: { ar: "٨ أرقام", en: "8 digits" },
  phonePrivate: {
    ar: "رقمك سري ولن يظهر علناً أبداً — يُستخدم لمنع التكرار فقط.",
    en: "Your number is private and never shown publicly — used only to prevent duplicates.",
  },
  phoneInvalid: { ar: "أدخل رقم هاتف صحيح مكوّن من ٨ أرقام", en: "Enter a valid 8-digit phone number" },
  phoneDuplicate: { ar: "تم التوقيع بهذا الرقم من قبل", en: "This phone number has already pledged" },
  consent: {
    ar: "أوافق على تسجيل اسمي ضمن وثيقة الولاء والتأييد على منصة BHmonitor.",
    en: "I agree to register my name in the Pledge of Loyalty & Support on the BHmonitor platform.",
  },
  generate: { ar: "إنشاء وثيقة الولاء", en: "Create my pledge" },
  signedOk: { ar: "تم توقيع وثيقتك بنجاح", en: "Your pledge has been signed" },
  savedNote: {
    ar: "احفظ صورة وثيقتك وشاركها مع أصدقائك.",
    en: "Save your pledge image and share it with friends.",
  },
  download: { ar: "تحميل الصورة", en: "Download" },
  whatsapp: { ar: "واتساب", en: "WhatsApp" },
  instagram: { ar: "قصة إنستغرام", en: "Instagram Story" },
  igSaved: {
    ar: "تم حفظ الصورة — افتح إنستغرام وأضفها إلى قصتك",
    en: "Image saved — open Instagram and add it to your story",
  },
  share: { ar: "مشاركة", en: "Share" },
  copied: { ar: "تم نسخ الرابط", en: "Link copied" },
  checkTitle: { ar: "هل وقّعت من قبل؟", en: "Already signed?" },
  checkDesc: {
    ar: "أدخل رقم هاتفك للتحقق من توقيعك على الوثيقة.",
    en: "Enter your phone number to verify your pledge.",
  },
  checkButton: { ar: "تحقّق", en: "Check" },
  checkSigned: { ar: "تم توقيع الوثيقة", en: "Pledge signed" },
  checkValidated: { ar: "موثّق", en: "Validated" },
  checkGetAgain: { ar: "احصل على وثيقتك مرة أخرى:", en: "Get your pledge image again:" },
  checkNotFound: { ar: "لا يوجد توقيع مسجّل بهذا الرقم.", en: "No pledge found for this number." },
  disclaimer: {
    ar: "هذه الوثيقة الرقمية مقدّمة من منصة BHmonitor كتعبير مجتمعي عن الولاء والتأييد، ولا تُعد بديلاً عن أي إجراءات رسمية أو تسليم ورقي معلن من الجهات المختصة.",
    en: "This digital document is provided by the BHmonitor platform as a community expression of loyalty and support, and is not a substitute for any official procedures or announced paper submission by the competent authorities.",
  },
  // toasts
  enterName: { ar: "الرجاء إدخال اسمك", en: "Please enter your name" },
  agreeFirst: { ar: "الرجاء الموافقة على عرض الاسم", en: "Please agree to display your name" },
  submitError: { ar: "تعذّر إرسال الوثيقة — حاول مجدداً", en: "Couldn't submit the pledge — please try again" },
  connError: { ar: "تعذّر الاتصال — تحقق من الشبكة", en: "Connection failed — check your network" },
  signedToast: { ar: "تم توقيع وثيقة الولاء بنجاح 🇧🇭", en: "Pledge signed successfully 🇧🇭" },
  imgError: { ar: "تعذّر تجهيز صورة الوثيقة", en: "Couldn't prepare the document image" },
} as const;

const WHATSAPP_TEXT: Record<PageLang, string> = {
  ar: "وقّعت على وثيقة الولاء والتأييد عبر منصة BHmonitor 🇧🇭\n\nشارك باسمك الآن:\nhttps://BHmonitor.com/pledge",
  en: "I signed the Pledge of Loyalty & Support on BHmonitor 🇧🇭\n\nAdd your name now:\nhttps://BHmonitor.com/pledge",
};

// Largest font (≥ floor) at which the name fits the slot width on ONE line.
// The poster name is always a single line — it just shrinks to fit, so the
// full 41-character maximum fits in one frame for both Arabic and English.
function fitPosterFontPx(ctx: CanvasRenderingContext2D, name: string): number {
  const maxW = POSTER_W * NAME_MAX_WIDTH;
  const { font, weight, maxPx } = posterFace(name);
  let px = maxPx;
  while (px > NAME_MIN_PX) {
    ctx.font = `${weight} ${px}px ${font}`;
    if (ctx.measureText(name).width <= maxW) break;
    px -= 1;
  }
  return Math.max(px, NAME_MIN_PX);
}

async function ensureFontLoaded(): Promise<void> {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts) return;
  try {
    await Promise.all([
      fonts.load(`700 ${NAME_FONT_PX}px 'Amiri'`),
      fonts.load(`700 ${NAME_FONT_PX}px 'Noto Kufi Arabic'`),
      fonts.load(`800 ${NAME_FONT_PX}px 'Noto Kufi Arabic'`),
    ]);
    await fonts.ready;
  } catch {
    /* font load is best-effort */
  }
}

function safeFileName(name: string): string {
  const safe = name.replace(/[\\/:*?"<>|\n\r\t]+/g, "").trim().slice(0, 40);
  return `BHmonitor-${safe || "pledge"}.jpg`;
}

export default function Pledge() {
  const { toast } = useToast();
  const { lang: siteLang } = useLang();

  // Page-local language toggle, seeded from the site preference (defaults AR).
  const [lang, setLang] = useState<PageLang>(siteLang === "en" ? "en" : "ar");
  const t = useCallback((k: keyof typeof COPY) => COPY[k][lang], [lang]);
  const isRtl = lang === "ar";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);

  const [total, setTotal] = useState<number | null>(null);

  // "Check your pledge" lookup
  const [checkPhone, setCheckPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ signed: boolean; full_name?: string } | null>(null);
  // True once we've regenerated the found pledge's poster (client-side, from the
  // saved name) so the user can download/share it again — nothing is stored.
  const [checkPosterReady, setCheckPosterReady] = useState(false);

  // Generated artefacts (kept in refs so download/share are instant + gesture-safe).
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewBoxRef = useRef<HTMLDivElement | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const posterFileRef = useRef<File | null>(null);
  const posterUrlRef = useRef<string | null>(null);
  const fileNameRef = useRef<string>("BHmonitor-pledge.jpg");

  const trimmedName = name.replace(/\s+/g, " ").trim();
  const displayName = trimmedName || t("posterPlaceholder");
  const phoneDigits = phone.replace(/\D/g, "").slice(0, 8);

  /* ── Live counter ──────────────────────────────────────────────────────── */
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/pledge-count");
        const data = (await res.json()) as { total?: number };
        if (active && typeof data.total === "number") setTotal(data.total);
      } catch {
        /* ignore — counter is non-critical */
      }
    };
    load();
    const id = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  /* ── Preview box width (keeps preview font scaled to the canvas) ───────── */
  useEffect(() => {
    const el = previewBoxRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setBoxWidth(e.contentRect.width);
    });
    ro.observe(el);
    setBoxWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Release any blob URL when leaving the page.
  useEffect(() => {
    return () => {
      if (posterUrlRef.current) URL.revokeObjectURL(posterUrlRef.current);
    };
  }, []);

  // Single-line font (at poster resolution) that fits the current name, scaled
  // to the on-screen preview width. Mirrors exactly what the canvas will draw.
  const naturalFitPx = useMemo(() => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return NAME_FONT_PX;
    return fitPosterFontPx(ctx, displayName);
  }, [displayName]);

  const previewFontPx = boxWidth ? (naturalFitPx * boxWidth) / POSTER_W : 0;
  const previewFace = posterFace(displayName);

  /* ── Check your pledge (phone lookup) ──────────────────────────────────── */
  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const digits = checkPhone.replace(/\D/g, "").slice(0, 8);
    if (digits.length !== 8) {
      toast({ title: t("phoneInvalid"), variant: "destructive" });
      return;
    }
    setChecking(true);
    setCheckResult(null);
    setCheckPosterReady(false);
    try {
      const res = await fetch("/api/pledge-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        signed?: boolean;
        full_name?: string;
        error?: string;
      };
      if (!res.ok) {
        toast({ title: data.error || t("connError"), variant: "destructive" });
        return;
      }
      // Found → rebuild their poster from the saved name so they can grab it
      // again (we never store the image, only the name).
      if (data.signed && data.full_name) {
        const file = await renderPosterFile(data.full_name);
        if (file) {
          if (posterUrlRef.current) URL.revokeObjectURL(posterUrlRef.current);
          posterFileRef.current = file;
          posterUrlRef.current = URL.createObjectURL(file);
          fileNameRef.current = file.name;
          setCheckPosterReady(true);
        }
      }
      setCheckResult({ signed: !!data.signed, full_name: data.full_name });
    } catch {
      toast({ title: t("connError"), variant: "destructive" });
    } finally {
      setChecking(false);
    }
  }

  /* ── Render the personalised poster to a File ──────────────────────────── */
  const renderPosterFile = useCallback(async (personName: string): Promise<File | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    canvas.width = POSTER_W;
    canvas.height = POSTER_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    await ensureFontLoaded();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = POSTER_SRC;
    try {
      await img.decode();
    } catch {
      return null;
    }

    ctx.clearRect(0, 0, POSTER_W, POSTER_H);
    ctx.drawImage(img, 0, 0, POSTER_W, POSTER_H);

    const face = posterFace(personName);
    const fontPx = fitPosterFontPx(ctx, personName);
    ctx.font = `${face.weight} ${fontPx}px ${face.font}`;
    ctx.fillStyle = NAME_COLOR;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Centre alignment renders either script correctly; hint direction by script.
    ctx.direction = /[A-Za-z]/.test(personName) && !/[ء-ي]/.test(personName) ? "ltr" : "rtl";
    // Always one line — shrunk to fit the slot width.
    ctx.fillText(personName, POSTER_W * NAME_CENTER_X, POSTER_H * NAME_BASELINE_Y);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), EXPORT_TYPE, EXPORT_QUALITY),
    );
    if (!blob) return null;
    return new File([blob], safeFileName(personName), { type: EXPORT_TYPE });
  }, []);

  /* ── Submit → record + render + open in a new tab ──────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmedName) {
      toast({ title: t("enterName"), variant: "destructive" });
      return;
    }
    if (phoneDigits.length !== 8) {
      toast({ title: t("phoneInvalid"), variant: "destructive" });
      return;
    }
    if (!consent) {
      toast({ title: t("agreeFirst"), variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: trimmedName, phone: phoneDigits, consent: true }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        total?: number;
        error?: string;
      };
      if (!res.ok || !data.success) {
        const title = res.status === 409 ? t("phoneDuplicate") : data.error || t("submitError");
        toast({ title, variant: "destructive" });
        return;
      }

      // Pre-render the image so Download / Share are instant and gesture-safe.
      const file = await renderPosterFile(trimmedName);
      if (!file) {
        toast({ title: t("imgError"), variant: "destructive" });
        return;
      }

      if (posterUrlRef.current) URL.revokeObjectURL(posterUrlRef.current);
      posterFileRef.current = file;
      posterUrlRef.current = URL.createObjectURL(file);
      fileNameRef.current = file.name;

      setSigned(true);
      if (typeof data.total === "number") setTotal(data.total);
      toast({ title: t("signedToast") });
    } catch {
      toast({ title: t("connError"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Download / share ──────────────────────────────────────────────────── */
  function handleDownload() {
    const url = posterUrlRef.current;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileNameRef.current;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function shareImageVia(): Promise<boolean> {
    const file = posterFileRef.current;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: WHATSAPP_TEXT[lang], title: COPY.heading[lang] });
      } catch {
        /* user dismissed the sheet — treat as handled */
      }
      return true;
    }
    return false;
  }

  // WhatsApp: jump straight to WhatsApp with the message + pledge link (AR/EN).
  // No OS share sheet — a single tap into WhatsApp to forward to friends.
  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(WHATSAPP_TEXT[lang])}`, "_blank", "noopener");
  }

  // Instagram Story: save the rendered image, then open Instagram (story camera
  // on mobile) so they can add it. Web has no API to auto-post, so this is the
  // most direct route — straight to Instagram, not the generic share sheet.
  function handleInstagram() {
    handleDownload();
    toast({ title: t("igSaved") });
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent || "");
    window.open(
      isMobile ? "instagram://story-camera" : "https://www.instagram.com/",
      "_blank",
      "noopener",
    );
  }

  // General share: the OS share sheet (with the image where supported) for any
  // other app — Messages, X, AirDrop, etc.
  async function handleShare() {
    if (await shareImageVia()) return;
    if (navigator.share) {
      try {
        await navigator.share({ text: WHATSAPP_TEXT[lang], title: COPY.heading[lang] });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(WHATSAPP_TEXT[lang]);
      toast({ title: t("copied") });
    } catch {
      handleDownload();
    }
  }

  const counterText = useMemo(() => {
    if (total === null) return "…";
    const formatted = total.toLocaleString("en-US");
    return total > 0 ? `${formatted}+` : formatted;
  }, [total]);

  // Download + share buttons — reused after signing AND after a phone lookup
  // re-creates the poster. All read the pre-rendered poster in the refs.
  const shareActions = (
    <div className="space-y-2.5">
      {/* Instagram is the headline share action */}
      <Button
        type="button"
        onClick={handleInstagram}
        className="w-full h-12 gap-2 border-0 text-white font-bold bg-gradient-to-tr from-[#FEDA77] via-[#DD2A7B] to-[#8134AF] hover:opacity-95 shadow-[0_12px_34px_-14px_rgba(221,42,123,0.7)]"
        data-testid="btn-share-instagram"
      >
        <SiInstagram className="w-5 h-5" />
        {t("instagram")}
      </Button>
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          type="button"
          onClick={handleWhatsApp}
          className="h-11 gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white"
          data-testid="btn-share-whatsapp"
        >
          <SiWhatsapp className="w-5 h-5" />
          {t("whatsapp")}
        </Button>
        <Button type="button" variant="outline" onClick={handleDownload} className="h-11 gap-2" data-testid="btn-download-pledge">
          <Download className="w-5 h-5" />
          {t("download")}
        </Button>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleShare}
        className="w-full h-11 gap-2"
        data-testid="btn-share-more"
      >
        <Share2 className="w-4 h-4" />
        {t("share")}
      </Button>
    </div>
  );

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      lang={lang}
      className="relative min-h-screen overflow-hidden"
      style={{ paddingTop: "var(--header-offset)", fontFamily: UI_FONT }}
      data-testid="page-pledge"
    >
      {/* Atmosphere: gold + crimson aura over the site grain */}
      <div className="pointer-events-none absolute inset-0 noise-texture pledge-aura" aria-hidden="true" />

      <div className="relative max-w-xl mx-auto px-5 py-10 space-y-11">
        {/* Top bar: BHmonitor wordmark + language toggle */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-bold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_2px_hsl(var(--primary)/0.5)]" />
            BHmonitor
          </span>
          <div
            dir="ltr"
            className="inline-flex gap-1 rounded-full border border-border/50 bg-background/40 backdrop-blur p-1"
            data-testid="pledge-lang-toggle"
          >
            <button
              type="button"
              onClick={() => setLang("ar")}
              style={{ fontFamily: ARABIC_FONT }}
              className={`px-3.5 py-1.5 text-sm font-bold rounded-full transition-colors ${
                lang === "ar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="pledge-lang-ar"
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3.5 py-1.5 text-sm font-bold rounded-full transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="pledge-lang-en"
            >
              English
            </button>
          </div>
        </div>

        {/* Hero */}
        <header className="text-center space-y-5">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mx-auto">
            <span className="absolute inset-0 rounded-full border border-[#C9A227]/45" />
            <span className="absolute inset-[6px] rounded-full border border-[#C9A227]/20" />
            <span className="text-[26px] leading-none">🇧🇭</span>
          </div>
          <h1
            className={`font-extrabold leading-tight ${isRtl ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl tracking-tight"}`}
          >
            {t("heading")}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">{t("intro")}</p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <span className="h-px w-16 gold-hairline" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#C9A227]/70" />
            <span className="h-px w-16 gold-hairline" />
          </div>
        </header>

        {/* Live counter */}
        <div className="text-center space-y-1.5">
          <div
            dir="ltr"
            className="text-5xl sm:text-6xl font-black tabular-nums leading-none"
            style={{ color: NAME_COLOR }}
            data-testid="pledge-counter"
          >
            {counterText}
          </div>
          <div className={`text-xs font-semibold text-muted-foreground ${isRtl ? "" : "uppercase tracking-[0.18em]"}`}>
            {t("counterLabel")}
          </div>
          <div className="pt-2">
            <Link
              href="/wall"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-all hover:gap-2.5"
              data-testid="pledge-view-wall"
            >
              <Users className="w-4 h-4" />
              {t("viewWall")}
            </Link>
          </div>
        </div>

        {/* Poster preview */}
        <div
          ref={previewBoxRef}
          className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden gold-ring"
          style={{ aspectRatio: `${POSTER_W} / ${POSTER_H}` }}
          data-testid="pledge-poster"
        >
          <img
            src={POSTER_SRC}
            alt={t("heading")}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <div
            className="absolute left-0 right-0 text-center px-4"
            style={{ top: `${NAME_BASELINE_Y * 100}%`, transform: "translateY(-50%)" }}
          >
            <span
              dir="auto"
              className={trimmedName ? "" : "opacity-40"}
              style={{
                fontFamily: previewFace.font,
                fontWeight: previewFace.weight,
                fontSize: previewFontPx ? `${previewFontPx}px` : "5vw",
                color: NAME_COLOR,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              {displayName}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5 border border-[#C9A227]/15">
          <div className="space-y-2">
            <label
              htmlFor="pledge-name"
              className={`block text-[11px] font-bold text-muted-foreground ${isRtl ? "" : "uppercase tracking-wider"}`}
            >
              {t("nameLabel")}
            </label>
            <input
              id="pledge-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={41}
              placeholder={t("namePlaceholder")}
              dir="auto"
              className="w-full h-12 rounded-xl bg-background/50 border border-border/60 px-4 text-base transition-colors focus:outline-none focus:border-[#C9A227]/60 focus:ring-2 focus:ring-[#C9A227]/25"
              data-testid="input-pledge-name"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pledge-phone"
              className={`block text-[11px] font-bold text-muted-foreground ${isRtl ? "" : "uppercase tracking-wider"}`}
            >
              {t("phoneLabel")}
            </label>
            <div dir="ltr" className="flex items-stretch gap-2">
              <span className="inline-flex items-center px-3 h-12 rounded-xl bg-background/50 border border-border/60 text-base font-medium text-muted-foreground select-none">
                +973
              </span>
              <input
                id="pledge-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phoneDigits}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                maxLength={8}
                placeholder={t("phonePlaceholder")}
                dir="ltr"
                className="flex-1 h-12 rounded-xl bg-background/50 border border-border/60 px-4 text-base tracking-widest transition-colors focus:outline-none focus:border-[#C9A227]/60 focus:ring-2 focus:ring-[#C9A227]/25"
                data-testid="input-pledge-phone"
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{t("phonePrivate")}</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-5 h-5 shrink-0 accent-primary"
              data-testid="checkbox-consent"
            />
            <span className="text-[13px] leading-relaxed text-foreground/85">{t("consent")}</span>
          </label>

          {!signed ? (
            <Button
              type="submit"
              className="w-full h-12 gap-2 text-base font-bold shadow-[0_12px_34px_-14px_hsl(var(--primary)/0.55)]"
              disabled={submitting}
              data-testid="btn-generate-pledge"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {t("generate")}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm font-bold" style={{ color: NAME_COLOR }}>
                <CheckCircle2 className="w-5 h-5" />
                {t("signedOk")}
              </div>
              <p className="text-xs text-center text-muted-foreground">{t("savedNote")}</p>
              {shareActions}
            </div>
          )}
        </form>

        {/* Check your pledge (private phone lookup) */}
        <form onSubmit={handleCheck} className="glass-card rounded-2xl p-5 space-y-4" data-testid="pledge-check">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/25">
              <SearchCheck className="w-5 h-5" style={{ color: NAME_COLOR }} />
            </div>
            <h2 className="text-lg font-bold">{t("checkTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("checkDesc")}</p>
          </div>

          <div dir="ltr" className="flex items-stretch gap-2">
            <span className="inline-flex items-center px-3 h-12 rounded-xl bg-background/50 border border-border/60 text-base font-medium text-muted-foreground select-none">
              +973
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={checkPhone.replace(/\D/g, "").slice(0, 8)}
              onChange={(e) => {
                setCheckPhone(e.target.value.replace(/\D/g, "").slice(0, 8));
                setCheckResult(null);
                setCheckPosterReady(false);
              }}
              maxLength={8}
              placeholder={t("phonePlaceholder")}
              dir="ltr"
              className="flex-1 h-12 rounded-xl bg-background/50 border border-border/60 px-4 text-base tracking-widest transition-colors focus:outline-none focus:border-[#C9A227]/60 focus:ring-2 focus:ring-[#C9A227]/25"
              data-testid="input-check-phone"
            />
          </div>

          <Button type="submit" variant="outline" className="w-full h-11 gap-2" disabled={checking} data-testid="btn-check">
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchCheck className="w-4 h-4" />}
            {t("checkButton")}
          </Button>

          {checkResult &&
            (checkResult.signed ? (
              <div className="space-y-3" data-testid="check-result-signed">
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-green-500 font-bold">
                    <BadgeCheck className="w-5 h-5" />
                    {t("checkSigned")} · {t("checkValidated")}
                  </div>
                  <div className="name-face text-base font-extrabold" dir="auto">{checkResult.full_name}</div>
                </div>
                {checkPosterReady && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-center text-muted-foreground">{t("checkGetAgain")}</p>
                    {shareActions}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground" data-testid="check-result-none">
                {t("checkNotFound")}
              </p>
            ))}
        </form>

        {/* Disclaimer — always visible */}
        <p className="text-xs text-muted-foreground leading-relaxed text-center border-t border-border/40 pt-6">
          {t("disclaimer")}
        </p>
        <div className="text-center">
          <Link
            href={`/pledge/about?lang=${lang}`}
            className="text-sm font-bold text-primary hover:underline"
            data-testid="pledge-about-link"
          >
            {t("aboutLink")}
          </Link>
        </div>
      </div>

      {/* Offscreen canvas for high-res rendering */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
