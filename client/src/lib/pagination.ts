// Pure pagination helpers — no DOM/React deps, so they're unit-testable.

/**
 * Build a compact, de-duplicated page list with ellipses for a numbered pager:
 *   pageItems(6, 20) → [1, "…", 5, 6, 7, "…", 20]
 *   pageItems(1, 5)  → [1, 2, 3, 4, 5]   (≤7 pages: show all)
 * Always includes the first and last page; the window hugs the current page.
 */
export function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("…");
  items.push(total);

  return items;
}

/** Clamp a (possibly garbage) requested page into [1, totalPages]. */
export function clampPage(requested: unknown, totalPages: number): number {
  const n = typeof requested === "number" ? requested : Number.parseInt(String(requested ?? ""), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(1, Math.trunc(n)), Math.max(1, totalPages));
}
