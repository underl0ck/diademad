import type {
  Fundamentals, Quote, PriceSeries, PricePoint, PeerMetrics,
} from "../../src/lib/valuation/types";
import {
  ITUB_MOCK, PBR_MOCK, NEG_MOCK,
  ITUB_SERIES, PBR_SERIES, NEG_SERIES,
} from "../../src/lib/mock/fundamentals";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function prng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePeer(prefix: string, r: () => number, sector: string): PeerMetrics {
  return {
    ticker: prefix, sector,
    peRatio: 8 + r() * 20,
    evToEbitda: 4 + r() * 12,
    pbRatio: 0.8 + r() * 3,
    priceToSales: 0.5 + r() * 4,
  };
}

function generatedFundamentals(ticker: string): Fundamentals {
  const r = prng(hash(ticker));
  const sector = ["Technology", "Industrials", "Consumer", "Healthcare", "Energy"][Math.floor(r() * 5)];
  const basePrice = 20 + r() * 180;
  const shares = Math.floor(1e8 + r() * 5e9);
  const revenue = basePrice * shares * (0.3 + r() * 0.7);
  const opMargin = 0.08 + r() * 0.20;
  const netMargin = opMargin * (0.55 + r() * 0.3);
  const fcfMargin = netMargin * (0.65 + r() * 0.45);
  const dividendYield = r() < 0.4 ? 0 : 0.01 + r() * 0.04;
  const fcfBase = revenue * fcfMargin;
  const eps = (revenue * netMargin) / shares;

  return {
    ticker, name: `${ticker} (mock)`, sector, currency: "USD", fiscalYearEnd: "12-31",
    currentPrice: basePrice, sharesOutstanding: shares, marketCap: basePrice * shares,
    revenueTTM: revenue, operatingIncomeTTM: revenue * opMargin,
    ebitdaTTM: revenue * (opMargin + 0.05), netIncomeTTM: revenue * netMargin,
    epsTTM: eps, epsForward: eps * (1.02 + r() * 0.08),
    totalDebt: revenue * (0.2 + r() * 0.4),
    cashAndEquivalents: revenue * (0.1 + r() * 0.2),
    totalEquity: revenue * (0.4 + r() * 0.4),
    investedCapital: revenue * (0.5 + r() * 0.5),
    interestExpenseTTM: revenue * 0.02 * (0.5 + r() * 0.5),
    effectiveTaxRate: 0.21,
    freeCashFlowTTM: fcfBase, operatingCashFlowTTM: fcfBase * 1.2,
    capitalExpendituresTTM: fcfBase * 0.3,
    depreciationAmortizationTTM: revenue * 0.05,
    changeInWorkingCapitalTTM: -revenue * 0.01,
    fcfHistory5Y: [fcfBase * 0.7, fcfBase * 0.8, fcfBase * 0.85, fcfBase * 0.95, fcfBase],
    dividendPerShare: basePrice * dividendYield,
    dividendGrowthRate5Y: dividendYield > 0 ? 0.05 : 0,
    payoutRatio: dividendYield > 0 ? 0.4 : 0,
    revenueGrowth5Y: 0.05 + r() * 0.15,
    epsGrowth5Y: 0.03 + r() * 0.15,
    beta: 0.8 + r() * 0.8,
    riskFreeRate: 0.045, equityRiskPremium: 0.055, longTermGrowthRate: 0.025,
    analystTargetPrice: basePrice * (0.9 + r() * 0.3),
    analystTargetLow: basePrice * (0.75 + r() * 0.1),
    analystTargetHigh: basePrice * (1.1 + r() * 0.3),
    peers: [makePeer(ticker + "A", r, sector), makePeer(ticker + "B", r, sector), makePeer(ticker + "C", r, sector)],
    source: "mock", asOf: new Date().toISOString(),
  };
}

const NAMED_F: Record<string, Fundamentals> = { ITUB: ITUB_MOCK, PBR: PBR_MOCK, GROW: NEG_MOCK };
const NAMED_S: Record<string, PriceSeries> = { ITUB: ITUB_SERIES, PBR: PBR_SERIES, GROW: NEG_SERIES };

export function mockFundamentals(ticker: string): Fundamentals {
  const t = ticker.toUpperCase();
  const base = NAMED_F[t] ?? generatedFundamentals(t);
  return { ...base, asOf: new Date().toISOString() };
}

export function mockQuote(ticker: string): Quote {
  const f = mockFundamentals(ticker);
  const r = prng(hash(ticker + ":quote"));
  const change = f.currentPrice * (r() - 0.5) * 0.04;
  return {
    ticker: f.ticker, price: f.currentPrice, change,
    changePercent: change / f.currentPrice,
    volume: Math.floor(1e6 + r() * 5e7),
    asOf: f.asOf, source: "mock",
  };
}

export function mockSeries(ticker: string): PriceSeries {
  const t = ticker.toUpperCase();
  const named = NAMED_S[t];
  if (named) return { ...named, points: named.points.map((p) => ({ ...p })), asOf: new Date().toISOString() };

  const f = mockFundamentals(t);
  const r = prng(hash(t + ":series"));
  const n = 260;
  const today = new Date();
  const startPrice = f.currentPrice * (0.6 + r() * 0.3);
  const points: PricePoint[] = [];
  for (let i = 0; i < n; i++) {
    const trend = (i / n) * (f.currentPrice - startPrice) + startPrice;
    const noise = (r() - 0.5) * f.currentPrice * 0.06;
    const close = Math.max(0.01, trend + noise);
    const d = new Date(today);
    d.setDate(d.getDate() - (n - 1 - i) * 7);
    points.push({
      date: d.toISOString().slice(0, 10),
      open: close * 0.99, high: close * 1.02, low: close * 0.98, close,
      volume: Math.floor(1e6 + r() * 5e7),
    });
  }
  return { ticker: f.ticker, points, asOf: new Date().toISOString(), source: "mock" };
}
