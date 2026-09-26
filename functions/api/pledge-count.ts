import type { ApiContext, Env } from "../_lib/types";
import { json, notAllowed } from "../_lib/http";

// Reads the maintained counter — never COUNT(*) the wall.
export const onRequest: PagesFunction<Env> = async ({ env, request }: ApiContext) => {
  if (request.method !== "GET") return notAllowed();

  const row = await env.DB.prepare(
    "SELECT value FROM pledge_stats WHERE key = 'total_pledges'",
  ).first<{ value: number }>();

  return json({ total: row?.value ?? 0 });
};
