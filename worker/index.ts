import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { withCache } from "./lib/cache";
import { mockFundamentals, mockQuote, mockSeries } from "./lib/mock";
import { fetchFundamentalsFmp, fetchQuoteFmp, fetchSeriesFmp } from "./lib/fmp";
import { rateLimit, maxBodySize } from "./middleware/security";
import { withSession, requireAuth } from "./middleware/auth";
import type { Bindings, AuthVariables } from "./lib/bindings";
import authRoutes from "./auth";

const app = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

app.use("*", secureHeaders({
  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
  strictTransportSecurity: "max-age=31536000; includeSubDomains",
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https://avatars.githubusercontent.com"],
    connectSrc: ["'self'"],
  },
}));

app.use("*", withSession);

app.get("/api/health", (c) =>
  c.json({ ok: true, app: "diademad", ts: new Date().toISOString(), fmpConfigured: !!c.env.FMP_API_KEY })
);

app.route("/api/auth", authRoutes);

app.use("/api/quote/*", rateLimit("API_LIMITER"));
app.use("/api/fundamentals/*", rateLimit("API_LIMITER"));
app.use("/api/series/*", rateLimit("API_LIMITER"));
app.use("/api/watchlist", rateLimit("HEAVY_LIMITER"), requireAuth);
app.use("/api/watchlist/*", rateLimit("HEAVY_LIMITER"), requireAuth, maxBodySize(256));

app.get("/api/quote/:ticker", async (c) => {
  const ticker = c.req.param("ticker").toUpperCase();
  const { data, hit } = await withCache(`v1:quote:${ticker}`, c.executionCtx, 900,
    async () => (await fetchQuoteFmp(ticker, c.env)) ?? mockQuote(ticker));
  c.header("X-Cache", hit ? "HIT" : "MISS");
  return data ? c.json(data) : c.json({ error: "not found" }, 404);
});

app.get("/api/fundamentals/:ticker", async (c) => {
  const ticker = c.req.param("ticker").toUpperCase();
  const { data, hit } = await withCache(`v1:fundamentals:${ticker}`, c.executionCtx, 86400,
    async () => (await fetchFundamentalsFmp(ticker, c.env)) ?? mockFundamentals(ticker));
  c.header("X-Cache", hit ? "HIT" : "MISS");
  return data ? c.json(data) : c.json({ error: "not found" }, 404);
});

app.get("/api/series/:ticker", async (c) => {
  const ticker = c.req.param("ticker").toUpperCase();
  const { data, hit } = await withCache(`v1:series:${ticker}`, c.executionCtx, 3600,
    async () => (await fetchSeriesFmp(ticker, c.env)) ?? mockSeries(ticker));
  c.header("X-Cache", hit ? "HIT" : "MISS");
  return data ? c.json(data) : c.json({ error: "not found" }, 404);
});

const TICKER_RE = /^[A-Z0-9.]{1,10}$/;

app.get("/api/watchlist", async (c) => {
  const userId = c.get("user")!.id;
  const { results } = await c.env.DB
    .prepare("SELECT ticker, added_at FROM watchlist WHERE user_id = ? ORDER BY added_at DESC")
    .bind(userId).all<{ ticker: string; added_at: number }>();
  return c.json(results);
});

app.post("/api/watchlist/:ticker", async (c) => {
  const userId = c.get("user")!.id;
  const ticker = c.req.param("ticker").toUpperCase();
  if (!TICKER_RE.test(ticker)) return c.json({ error: "invalid ticker" }, 400);
  await c.env.DB
    .prepare("INSERT OR IGNORE INTO watchlist (id, user_id, ticker, added_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), userId, ticker, Date.now()).run();
  return c.json({ ok: true, ticker });
});

app.delete("/api/watchlist/:ticker", async (c) => {
  const userId = c.get("user")!.id;
  const ticker = c.req.param("ticker").toUpperCase();
  if (!TICKER_RE.test(ticker)) return c.json({ error: "invalid ticker" }, 400);
  await c.env.DB
    .prepare("DELETE FROM watchlist WHERE user_id = ? AND ticker = ?")
    .bind(userId, ticker).run();
  return c.json({ ok: true, ticker });
});

export default app;
