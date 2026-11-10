import type { Fundamentals, Quote, PriceSeries } from "../../src/lib/valuation/types";

const BASE = "https://financialmodelingprep.com";

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchQuoteFmp(
  ticker: string,
  env: { FMP_API_KEY?: string },
): Promise<Quote | null> {
  const k = env.FMP_API_KEY;
  if (!k) return null;
  const data = await getJson<any[]>(`${BASE}/stable/quote?symbol=${ticker}&apikey=${k}`);
  if (!Array.isArray(data) || data.length === 0) return null;
  const q = data[0];
  if (typeof q.price !== "number") return null;
  return {
    ticker,
    price: q.price,
    change: typeof q.change === "number" ? q.change : 0,
    changePercent: typeof q.changePercentage === "number" ? q.changePercentage : 0,
    volume: typeof q.volume === "number" ? q.volume : 0,
    asOf: new Date().toISOString(),
    source: "fmp",
  };
}

// Fundamentals mapping intentionally unimplemented.
// Field names for /stable/ endpoints must be verified against a live key
// before shipping. When you get one, we test the response shape together.
export async function fetchFundamentalsFmp(_t: string, _e: { FMP_API_KEY?: string }): Promise<Fundamentals | null> { return null; }
export async function fetchSeriesFmp(_t: string, _e: { FMP_API_KEY?: string }): Promise<PriceSeries | null> { return null; }
