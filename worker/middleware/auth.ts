import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import type { Bindings, AuthVariables, AuthUser } from "../lib/bindings";

export const SESSION_COOKIE = "diademad_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function loadUser(
  db: D1Database,
  sessionId: string | undefined,
): Promise<AuthUser | null> {
  if (!sessionId) return null;
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare(
      `SELECT u.id, u.github_login, u.email, u.name, u.avatar_url
       FROM sessions s JOIN users u ON s.user_id = u.id
       WHERE s.id = ? AND s.expires_at > ?`
    )
    .bind(sessionId, now)
    .first<AuthUser>();
  return row ?? null;
}

export const requireAuth: MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AuthVariables;
}> = async (c, next) => {
  if (!c.get("user")) {
    return c.json({ error: "unauthorized" }, 401);
  }
  await next();
};

export const withSession: MiddlewareHandler<{
  Bindings: Bindings;
  Variables: AuthVariables;
}> = async (c, next) => {
  const sessionId = getCookie(c, SESSION_COOKIE);
  const user = await loadUser(c.env.DB, sessionId);
  c.set("user", user);
  await next();
};
