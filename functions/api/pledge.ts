import type { ApiContext, Env } from "../_lib/types";
import { clientIp, error, json, notAllowed, readJson } from "../_lib/http";
import { validateName, validatePhone } from "../_lib/pledge";

interface Body {
  full_name?: string;
  phone?: string;
  consent?: boolean;
}

const RATE_LIMIT = 5; // submissions
const RATE_WINDOW_SEC = 60; // per IP per minute

export const onRequest: PagesFunction<Env> = async ({ env, request }: ApiContext) => {
  if (request.method !== "POST") return notAllowed();

  const body = (await readJson<Body>(request)) ?? {};

  // Consent is mandatory — name only appears on the wall with it.
  if (body.consent !== true) {
    return error("يجب الموافقة على عرض الاسم · Consent is required", 400);
  }

  const result = validateName(body.full_name);
  if (!result.ok || !result.display || !result.normalized) {
    return error(result.message ?? "اسم غير صالح · Invalid name", 400);
  }

  const phoneResult = validatePhone(body.phone);
  if (!phoneResult.ok || !phoneResult.value) {
    return error(phoneResult.message ?? "رقم هاتف غير صالح · Invalid phone number", 400);
  }
  const phone = phoneResult.value;

  // One pledge per phone number (private — never returned publicly).
  const existing = await env.DB.prepare("SELECT 1 FROM pledges WHERE phone = ? LIMIT 1")
    .bind(phone)
    .first();
  if (existing) {
    return error("تم التوقيع بهذا الرقم من قبل · This phone number has already pledged", 409);
  }

  // ── Rate limit by IP (names stay out of `pledges`; IPs live in pledge_rate)
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

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const nowSql = createdAt.replace("T", " ").slice(0, 19);
  const pruneBefore = new Date(Date.now() - 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

  // Insert pledge + bump counter atomically; record the IP for rate limiting
  // and prune stale rate rows in the same batch. The UNIQUE index on phone is
  // the final guard against a duplicate slipping past the check above.
  try {
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO pledges (id, full_name, normalized_name, phone, created_at, status) VALUES (?, ?, ?, ?, ?, 'active')",
      ).bind(id, result.display, result.normalized, phone, createdAt),
      env.DB.prepare("UPDATE pledge_stats SET value = value + 1 WHERE key = 'total_pledges'"),
      env.DB.prepare("INSERT INTO pledge_rate (ip_address, created_at) VALUES (?, ?)").bind(ip, nowSql),
      env.DB.prepare("DELETE FROM pledge_rate WHERE created_at < ?").bind(pruneBefore),
    ]);
  } catch (e) {
    // Unique-index violation → concurrent duplicate submission.
    if (String((e as Error)?.message ?? "").toUpperCase().includes("UNIQUE")) {
      return error("تم التوقيع بهذا الرقم من قبل · This phone number has already pledged", 409);
    }
    throw e;
  }

  const stat = await env.DB.prepare(
    "SELECT value FROM pledge_stats WHERE key = 'total_pledges'",
  ).first<{ value: number }>();

  return json({ success: true, total: stat?.value ?? 0 });
};
