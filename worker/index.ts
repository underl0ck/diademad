import { Hono } from "hono";
import { withCache } from "./lib/cache";
import { mockFundamentals, mockQuote, mockSeries } from "./lib/mock";
import { fetchFundamentalsFmp, fetchQuoteFmp, fetchSeriesFmp } from "./lib/fmp";

type Bindings = { FMP_API_KEY?: string };
const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/health", (c) =>
  c.json({ ok: true, app: "diademad", ts: new Date().toISOString(), fmpConfigured: !!c.env.FMP_API_KEY })
);

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

export default app;
