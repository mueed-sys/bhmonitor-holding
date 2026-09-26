// Tiny HTTP helpers for Pages Functions.

// Applied to every JSON response. Pages `_headers` does NOT cover Functions,
// so API responses harden themselves here. JSON loads nothing, so the CSP can
// be maximally strict.
const SECURITY_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex",
} as const;

export const json = (data: unknown, status = 200, extra?: HeadersInit) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...SECURITY_HEADERS, ...(extra ?? {}) },
  });

export const error = (message: string, status = 400, extra?: Record<string, unknown>) =>
  json({ ok: false, error: message, ...(extra ?? {}) }, status);

export const ok = (extra: Record<string, unknown> = {}) => json({ ok: true, ...extra });

export const notAllowed = () =>
  new Response(null, { status: 405, headers: { Allow: "GET, POST, PATCH, DELETE" } });

export function clientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0].trim() ??
    "unknown"
  );
}

export function userAgent(request: Request): string {
  return (request.headers.get("User-Agent") ?? "").slice(0, 500);
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
