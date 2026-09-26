import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, X, ChevronLeft, ChevronRight, Users, Heart, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { clampPage, pageItems } from "@/lib/pagination";

/* ──────────────────────────────────────────────────────────────────────────
 * Public pledge wall. Names only — newest first, 50 per page, name-search +
 * numbered pagination. Mirrors the /pledge page's self-contained bilingual
 * layout (its own AR/EN toggle, RTL-aware) and design language.
 * ────────────────────────────────────────────────────────────────────────── */

const NAME_COLOR = "#C9A227"; // ceremonial gold — matches the pledge poster name
const UI_FONT = "'DM Sans', 'Amiri', sans-serif"; // Latin → DM Sans, Arabic → Amiri
const ARABIC_FONT = "'Amiri', serif";
const PAGE_SIZE = 50;

type PageLang = "ar" | "en";

interface WallRow {
  name: string;
}
interface WallResponse {
  rows: WallRow[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

const COPY = {
  heading: { ar: "جدار المشاركين", en: "Wall of Participants" },
  intro: {
    ar: "أسماء الموقّعين على وثيقة الولاء والتأييد عبر منصة BHmonitor.",
    en: "Names of those who signed the Pledge of Loyalty & Support on BHmonitor.",
  },
  counterLabel: { ar: "مشارك", en: "participants" },
  searchPlaceholder: { ar: "ابحث عن اسمك…", en: "Search for your name…" },
  clear: { ar: "مسح", en: "Clear" },
  addName: { ar: "أضف اسمك", en: "Add your name" },
  empty: { ar: "لا توجد أسماء تطابق بحثك.", en: "No names match your search." },
  emptyAll: { ar: "لا توجد أسماء بعد — كن أول الموقّعين.", en: "No names yet — be the first to sign." },
  error: { ar: "تعذّر تحميل الجدار — حاول مجدداً.", en: "Couldn't load the wall — please try again." },
  retry: { ar: "إعادة المحاولة", en: "Retry" },
  prev: { ar: "السابق", en: "Prev" },
  next: { ar: "التالي", en: "Next" },
  pageOf: { ar: "صفحة", en: "Page" },
  of: { ar: "من", en: "of" },
  resultsFor: { ar: "نتائج البحث عن", en: "Results for" },
  verified: { ar: "أسماء موثّقة ومراجَعة", en: "Names are reviewed & moderated" },
} as const;

export default function Wall() {
  const { lang: siteLang } = useLang();
  const search = useSearch();
  const [, navigate] = useLocation();

  // Initialise page + query from the URL so the wall is shareable / back-safe.
  const initial = useMemo(() => new URLSearchParams(search), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [lang, setLang] = useState<PageLang>(siteLang === "ar" ? "ar" : "en");
  const [page, setPage] = useState<number>(() => {
    const p = Number.parseInt(initial.get("page") ?? "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [searchInput, setSearchInput] = useState(initial.get("q") ?? "");
  const [debounced, setDebounced] = useState(searchInput.trim());

  const t = (k: keyof typeof COPY) => COPY[k][lang];
  const isRtl = lang === "ar";

  // Debounce the search box; a new query resets to page 1.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = searchInput.trim();
      setDebounced((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Reflect page + query into the URL (replace, so we don't spam history).
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (debounced) params.set("q", debounced);
    const qs = params.toString();
    navigate(qs ? `/wall?${qs}` : "/wall", { replace: true });
  }, [page, debounced, navigate]);

  const queryUrl = `/api/pledges?page=${page}&search=${encodeURIComponent(debounced)}`;
  const { data, isLoading, isError, refetch, isFetching } = useQuery<WallResponse>({
    queryKey: [queryUrl],
    placeholderData: (prev) => prev, // keep old page visible while the next loads
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const counterText = useMemo(
    () => new Intl.NumberFormat(lang === "ar" ? "ar-BH" : "en-US").format(total),
    [total, lang],
  );

  const goTo = (p: number) => setPage(clampPage(p, totalPages));

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      lang={lang}
      className="relative min-h-screen overflow-hidden"
      style={{ paddingTop: "var(--header-offset)", fontFamily: UI_FONT }}
      data-testid="page-wall"
    >
      {/* Atmosphere: gold + crimson aura over the site grain */}
      <div className="pointer-events-none absolute inset-0 noise-texture pledge-aura" aria-hidden="true" />

      <div className="relative max-w-3xl mx-auto px-5 py-10 space-y-9">
        {/* Top bar: BHmonitor wordmark + language toggle */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-bold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_2px_hsl(var(--primary)/0.5)]" />
            BHmonitor
          </span>
          <div dir="ltr" className="inline-flex gap-1 rounded-full border border-border/50 bg-background/40 backdrop-blur p-1">
            <button
              type="button"
              onClick={() => setLang("ar")}
              style={{ fontFamily: ARABIC_FONT }}
              className={`px-3.5 py-1.5 text-sm font-bold rounded-full transition-colors ${
                lang === "ar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="wall-lang-ar"
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3.5 py-1.5 text-sm font-bold rounded-full transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="wall-lang-en"
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
            <Users className="w-6 h-6" style={{ color: NAME_COLOR }} />
          </div>
          <h1 className={`font-extrabold leading-tight ${isRtl ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl tracking-tight"}`}>
            {t("heading")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">{t("intro")}</p>
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
            data-testid="wall-counter"
          >
            {counterText}
          </div>
          <div className={`text-xs font-semibold text-muted-foreground ${isRtl ? "" : "uppercase tracking-[0.18em]"}`}>
            {t("counterLabel")}
          </div>
        </div>

        {/* Search + Add name */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none ${isRtl ? "right-4" : "left-4"}`} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className={`w-full h-12 rounded-xl bg-background/50 border border-border/60 text-base transition-colors focus:outline-none focus:border-[#C9A227]/60 focus:ring-2 focus:ring-[#C9A227]/25 ${
                isRtl ? "pr-11 pl-10" : "pl-11 pr-10"
              }`}
              data-testid="wall-search"
              aria-label={t("searchPlaceholder")}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className={`absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted ${isRtl ? "left-2" : "right-2"}`}
                aria-label={t("clear")}
                data-testid="wall-search-clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Link
            href="/pledge"
            className="h-12 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm whitespace-nowrap transition hover:opacity-90"
            data-testid="wall-add-name"
          >
            <Heart className="w-4 h-4" />
            {t("addName")}
          </Link>
        </div>

        {/* Search context line */}
        {debounced && !isLoading && (
          <p className="text-xs text-muted-foreground -mt-3">
            {t("resultsFor")} “<span className="font-semibold text-foreground">{debounced}</span>” — {new Intl.NumberFormat(lang === "ar" ? "ar-BH" : "en-US").format(total)}
          </p>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-busy="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl px-4 min-h-[58px] flex items-center animate-pulse">
                <div className="h-4 w-3/4 rounded bg-muted/60" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">{t("error")}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm"
              data-testid="wall-retry"
            >
              {t("retry")}
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">{debounced ? t("empty") : t("emptyAll")}</p>
          </div>
        ) : (
          <div className="relative">
            {isFetching && (
              <div className="absolute -top-6 inset-x-0 flex justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="wall-list">
              {rows.map((row, i) => (
                <li
                  key={`${page}-${i}-${row.name}`}
                  className={`glass-card rounded-xl px-4 py-3.5 flex items-center min-h-[58px] min-w-0 border-b-2 border-b-[#C9A227]/25 hover:border-b-[#C9A227]/60 transition-colors ${isRtl ? "text-right" : "text-left"}`}
                  data-testid="wall-item"
                >
                  <span
                    className="name-face w-full font-bold text-[17px] leading-snug line-clamp-2 break-words"
                    style={{ color: NAME_COLOR }}
                    title={row.name}
                  >
                    {row.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <nav dir="ltr" className="flex items-center justify-center flex-wrap gap-1.5 pt-2" aria-label="Pagination" data-testid="wall-pagination">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page <= 1}
              className="h-9 px-3 inline-flex items-center gap-1 rounded-lg border border-border/50 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/60 transition-colors"
              data-testid="wall-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageItems(page, totalPages).map((it, idx) =>
              it === "…" ? (
                <span key={`e${idx}`} className="px-2 text-muted-foreground select-none">…</span>
              ) : (
                <button
                  key={it}
                  type="button"
                  onClick={() => goTo(it)}
                  aria-current={it === page ? "page" : undefined}
                  style={it === page ? { backgroundColor: NAME_COLOR, color: "#1a1a1a" } : undefined}
                  className={`h-9 min-w-9 px-2 rounded-lg text-sm font-bold tabular-nums transition-colors ${
                    it === page ? "" : "border border-border/50 text-foreground hover:bg-muted/60"
                  }`}
                  data-testid={`wall-page-${it}`}
                >
                  {it}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages}
              className="h-9 px-3 inline-flex items-center gap-1 rounded-lg border border-border/50 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/60 transition-colors"
              data-testid="wall-next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}

        {/* Moderation note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t("verified")}</span>
        </div>
      </div>
    </div>
  );
}
