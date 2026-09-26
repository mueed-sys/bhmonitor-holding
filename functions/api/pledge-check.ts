import type { ApiContext, Env } from "../_lib/types";
import { clientIp, error, json, notAllowed, readJson } from "../_lib/http";
import { validatePhone } from "../_lib/pledge";

interface Body {
  phone?: string;
}

const RATE_LIMIT = 10; // checks
const RATE_WINDOW_SEC = 60; // per IP per minute

// POST /api/pledge-check  { phone }  → { signed, full_name? }
// Self-service "did I sign?" lookup. Returns only the name tied to the number;
// no other data. Rate-limited to deter enumeration.
export const onRequest: PagesFunction<Env> = async ({ env, request }: ApiContext) => {
  if (request.method !== "POST") return notAllowed();

  const body = (await readJson<Body>(request)) ?? {};
  const phoneResult = validatePhone(body.phone);
  if (!phoneResult.ok || !phoneResult.value) {
    return error(phoneResult.message ?? "رقم هاتف غير صالح · Invalid phone number", 400);
  }

  const ip = clientIp(request);
  const sinceIso = new Date(Date.now() - RATE_WINDOW_SEC * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS count FROM pledge_rate WHERE ip_address = ? AND created_at >= ?",
  )
    .bind(ip, sinceIso)
    .first<{ count: number }>();
  if ((recent?.count ?? 0) >= RATE_LIMIT) {
    return error("محاولات كثيرة — حاول بعد قليل · Too many attempts, try again shortly", 429);
  }
  const nowSql = new Date().toISOString().replace("T", " ").slice(0, 19);
  await env.DB.prepare("INSERT INTO pledge_rate (ip_address, created_at) VALUES (?, ?)")
    .bind(ip, nowSql)
    .run();

  const row = await env.DB.prepare(
    "SELECT full_name FROM pledges WHERE phone = ? AND status = 'active' LIMIT 1",
  )
    .bind(phoneResult.value)
    .first<{ full_name: string }>();

  return json(row ? { signed: true, full_name: row.full_name } : { signed: false });
};
