import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import type { Bindings, AuthVariables } from "./lib/bindings";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "./middleware/auth";

type AuthEnv = { Bindings: Bindings; Variables: AuthVariables };

const STATE_COOKIE = "diademad_oauth_state";
const STATE_TTL = 600;

const auth = new Hono<AuthEnv>();

function callbackUrl(c: { req: { url: string } }): string {
  const u = new URL(c.req.url);
  return `${u.origin}/api/auth/github/callback`;
}

// Retry helper: GitHub tokens can take a moment to propagate across their API edge.
async function fetchWithRetry(url: string, init: RequestInit, attempts = 3, delayMs = 600) {
  let last: Response | null = null;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, init);
    if (res.ok) return res;
    last = res;
    console.warn(`[auth] ${url} returned ${res.status} (attempt ${i + 1}/${attempts})`);
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return last!;
}

auth.get("/login", (c) => {
  const state = crypto.randomUUID();
  const origin = new URL(c.req.url).origin;
  const params = new URLSearchParams({
    client_id: c.env.GITHUB_CLIENT_ID,
    redirect_uri: callbackUrl(c),
    scope: "read:user user:email",
    state,
  });
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    secure: c.req.url.startsWith("https://"),
    sameSite: "Lax",
    path: "/",
    maxAge: STATE_TTL,
  });
  return c.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
});

auth.get("/github/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const cookieState = getCookie(c, STATE_COOKIE);

  console.log(`[auth] callback fired, code=${code?.slice(0, 8)}..., state=${state}`);

  deleteCookie(c, STATE_COOKIE, { path: "/" });

  if (!code || !state || state !== cookieState) {
    return c.redirect("/?auth=failed&reason=state", 302);
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: callbackUrl(c),
    }),
  });
  
  if (!tokenRes.ok) return c.redirect("/?auth=failed&reason=token", 302);
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) return c.redirect("/?auth=failed&reason=token", 302);

  const authHeader = {
    Authorization: `Bearer ${tokenData.access_token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "diademad/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const profileRes = await fetchWithRetry("https://api.github.com/user", { headers: authHeader });
  if (!profileRes.ok) {
    const body = await profileRes.text();
    console.error(`[auth] profile failed ${profileRes.status}: ${body}`);
    return c.redirect("/?auth=failed&reason=profile", 302);
  }

  const emailsRes = await fetch("https://api.github.com/user/emails", { headers: authHeader });
  const profile = (await profileRes.json()) as {
    id: number; login: string; name: string | null; avatar_url: string | null;
  };
  const emails = emailsRes.ok
    ? ((await emailsRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>)
    : [];
  const primary = emails.find((e) => e.primary && e.verified) ?? emails[0];
  const email = primary?.email ?? null;

  const now = Math.floor(Date.now() / 1000);
  const existing = await c.env.DB
    .prepare("SELECT id FROM users WHERE github_id = ?")
    .bind(String(profile.id))
    .first<{ id: string }>();

  let userId: string;
  if (existing) {
    userId = existing.id;
    await c.env.DB
      .prepare(
        `UPDATE users SET github_login = ?, email = ?, name = ?, avatar_url = ?, last_login_at = ?
         WHERE id = ?`
      )
      .bind(profile.login, email, profile.name, profile.avatar_url, now, userId)
      .run();
  } else {
    userId = crypto.randomUUID();
    await c.env.DB
      .prepare(
        `INSERT INTO users (id, github_id, github_login, email, name, avatar_url, created_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(userId, String(profile.id), profile.login, email, profile.name, profile.avatar_url, now, now)
      .run();
  }

  const sessionId = crypto.randomUUID();
  await c.env.DB
    .prepare("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(sessionId, userId, now, now + SESSION_TTL_SECONDS)
    .run();

  setCookie(c, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: c.req.url.startsWith("https://"),
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  
  return c.redirect("/", 302);
});

auth.post("/logout", async (c) => {
  const sessionId = getCookie(c, SESSION_COOKIE);
  if (sessionId) {
    await c.env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

auth.get("/me", (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default auth;
