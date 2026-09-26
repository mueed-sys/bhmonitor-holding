// Shared types for Pages Functions.

export interface Env {
  DB: D1Database;
}

export type ApiContext = EventContext<Env, string, unknown>;
