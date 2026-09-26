import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, ArrowRight, ChevronDown, Info, FileText } from "lucide-react";
import { ABOUT_CONTENT, type Block } from "@/content/pledge-about";

/* ──────────────────────────────────────────────────────────────────────────
 * Static bilingual info / legal page for the pledge. No DB, no API, no forms.
 * Content lives verbatim in @/content/pledge-about. Default language: Arabic.
 * Language persists via ?lang=ar|en so links are shareable.
 * ────────────────────────────────────────────────────────────────────────── */

// Latin → DM Sans, Arabic → Amiri (per-glyph fallback handles mixed scripts).
const FONT = "'DM Sans', 'Amiri', sans-serif";
type PageLang = "ar" | "en";

function BlockView({ block, isRtl }: { block: Block; isRtl: boolean }) {
  switch (block.type) {
    case "p":
      return <p className="text-[15px] leading-relaxed text-muted-foreground">{block.text}</p>;
    case "quote":
      return (
        <blockquote
          className={`rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-[15px] leading-relaxed font-semibold text-foreground ${
            isRtl ? "border-r-4 border-r-primary" : "border-l-4 border-l-primary"
          }`}
        >
          {block.text}
        </blockquote>
      );
    case "ul":
      return (
        <ul className={`space-y-1.5 text-[15px] leading-relaxed text-muted-foreground ${isRtl ? "pr-5" : "pl-5"} list-disc marker:text-primary/60`}>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className={`space-y-1.5 text-[15px] leading-relaxed text-muted-foreground ${isRtl ? "pr-5" : "pl-5"} list-decimal marker:text-primary/60 marker:font-semibold`}>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      );
  }
}

export default function PledgeAbout() {
  const search = useSearch();
  const [, navigate] = useLocation();

  const initialLang = useMemo<PageLang>(() => {
    const p = new URLSearchParams(search).get("lang");
    return p === "en" ? "en" : "ar"; // default Arabic
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [lang, setLang] = useState<PageLang>(initialLang);
  const isRtl = lang === "ar";
  const c = ABOUT_CONTENT[lang];

  // Keep ?lang in the URL so the page is shareable in the chosen language.
  useEffect(() => {
    navigate(`/pledge/about?lang=${lang}`, { replace: true });
  }, [lang, navigate]);

  // Honor deep links to section ids (#what, #faq, …) on first render.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      lang={lang}
      className="min-h-screen noise-texture"
      style={{ paddingTop: "var(--header-offset)", fontFamily: FONT }}
      data-testid="page-pledge-about"
    >
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Top bar: back link + language toggle */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/pledge"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            data-testid="about-back"
          >
            <BackIcon className="w-4 h-4" />
            {c.backLink}
          </Link>
          <div dir="ltr" className="inline-flex gap-1 rounded-full border border-border/50 bg-muted/40 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`px-3.5 py-1.5 text-sm font-bold rounded-full transition-colors ${
                lang === "ar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="about-lang-ar"
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3.5 py-1.5 text-sm font-bold rounded-full transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="about-lang-en"
            >
              English
            </button>
          </div>
        </div>

        {/* Section 1 — title + intro + notice */}
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mx-auto">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">{c.title}</h1>
          <div className={`space-y-3 ${isRtl ? "text-right" : "text-left"}`}>
            {c.intro.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">{p}</p>
            ))}
          </div>
        </header>

        <div className="glass-card rounded-2xl p-5 flex gap-3" data-testid="about-notice">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">{c.noticeLabel}</p>
            <p className="text-[14px] leading-relaxed text-muted-foreground">{c.notice}</p>
          </div>
        </div>

        {/* Sections 2–10 */}
        <div className="space-y-8">
          {c.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-3">
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">{section.heading}</h2>
              {section.blocks.map((block, i) => (
                <BlockView key={i} block={block} isRtl={isRtl} />
              ))}
            </section>
          ))}
        </div>

        {/* Section 11 — FAQ accordion */}
        <section id={c.faq.id} className="scroll-mt-24 space-y-3">
          <h2 className="text-lg font-extrabold tracking-tight text-foreground">{c.faq.heading}</h2>
          <div className="space-y-2">
            {c.faq.items.map((item, i) => (
              <details key={i} className="group glass-card rounded-xl overflow-hidden" data-testid="about-faq-item">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 py-3.5 text-[15px] font-bold text-foreground select-none [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <ChevronDown className="w-4 h-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4 -mt-1 text-[14px] leading-relaxed text-muted-foreground">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Section 12 — footer */}
        <footer id="disclaimer-footer" className="pt-4 border-t border-border/40 space-y-1.5 text-center">
          {c.footer.map((line, i) => (
            <p key={i} className="text-[12px] leading-relaxed text-muted-foreground">{line}</p>
          ))}
          <div className="pt-3">
            <Link
              href="/pledge"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              <BackIcon className="w-4 h-4" />
              {c.backLink}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
