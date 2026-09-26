import type { ApiContext, Env } from "../_lib/types";
import { json, notAllowed } from "../_lib/http";
import { isCleanName, normalizeName } from "../_lib/pledge";

// Public, read-only wall of pledge names. Names-only by design: this endpoint
// NEVER returns id, phone, status, or the signup date. Phone is intentionally
// NOT searchable here (the admin endpoint can) to prevent number enumeration.
// created_at stays in the DB purely to order newest-first; it is never sent.
//
// GET /api/pledges?page=1&search=                     newest first, 50 per page
//   → { rows: [{ name }], page, totalPages, total, pageSize }

const PAGE_SIZE = 50;

interface Row {
  full_name: string;
}

// Escape LIKE wildcards so a user-typed % or _ is treated literally.
const escapeLike = (s: string) => s.replace(/[%_\\]/g, (m) => `\\${m}`);

export const onRequest: PagesFunction<Env> = async ({ env, request }: ApiContext) => {
  if (request.method !== "GET") return notAllowed();

  const url = new URL(request.url);
  const search = normalizeName(url.searchParams.get("search") ?? url.searchParams.get("q") ?? "");
  const hasSearch = search.length > 0;
  const likeArg = hasSearch ? `%${escapeLike(search)}%` : null;

  // Total for pagination. No search → the maintained counter (never COUNT(*)
  // the whole wall). With search → a COUNT over the filtered, indexed column.
  let total: number;
  if (hasSearch) {
    const c = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM pledges WHERE status = 'active' AND normalized_name LIKE ? ESCAPE '\\'",
    )
      .bind(likeArg)
      .first<{ count: number }>();
    total = c?.count ?? 0;
  } else {
    const stat = await env.DB.prepare(
      "SELECT value FROM pledge_stats WHERE key = 'total_pledges'",
    ).first<{ value: number }>();
    total = stat?.value ?? 0;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Parse + clamp the requested page into [1, totalPages]; bad input → page 1.
  const parsed = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(parsed) ? Math.min(Math.max(1, parsed), totalPages) : 1;
  const offset = (page - 1) * PAGE_SIZE;

  // created_at is used only to order newest-first; it is never selected/returned.
  let sql = "SELECT full_name FROM pledges WHERE status = 'active'";
  const binds: unknown[] = [];
  if (hasSearch) {
    sql += " AND normalized_name LIKE ? ESCAPE '\\'";
    binds.push(likeArg);
  }
  sql += ` ORDER BY created_at DESC, id DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`;

  const { results } = await env.DB.prepare(sql).bind(...binds).all<Row>();

  const rows = (results ?? [])
    // Defense-in-depth: hide anything that predates a blocklist update.
    .filter((r) => isCleanName(normalizeName(r.full_name)))
    .map((r) => ({ name: r.full_name }));

  return json({ rows, page, totalPages, total, pageSize: PAGE_SIZE });
};
