import type { Fundamentals, PriceSeries, PricePoint } from "../valuation/types";

function seriesFromCloses(ticker: string, closes: number[]): PriceSeries {
  const points: PricePoint[] = [];
  const today = new Date();
  closes.forEach((c, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (closes.length - 1 - i) * 7);
    points.push({
      date: d.toISOString().slice(0, 10),
      open: c, high: c * 1.01, low: c * 0.99, close: c,
      volume: 1_000_000,
    });
  });
  return { ticker, points, asOf: new Date().toISOString(), source: "mock" };
}

// Archetype 1: profitable dividend payer — every model should be applicable
export const ITUB_MOCK: Fundamentals = {
  ticker: "ITUB", name: "Itaú Unibanco (mock)", sector: "Financials",
  currency: "USD", fiscalYearEnd: "12-31",
  currentPrice: 6.20, sharesOutstanding: 9_800_000_000,
  marketCap: 6.20 * 9_800_000_000,
  revenueTTM: 32_000_000_000, operatingIncomeTTM: 9_600_000_000,
  ebitdaTTM: 11_000_000_000, netIncomeTTM: 7_800_000_000,
  epsTTM: 0.80, epsForward: 0.88,
  totalDebt: 90_000_000_000, cashAndEquivalents: 25_000_000_000,
  totalEquity: 42_000_000_000, investedCapital: 120_000_000_000,
  interestExpenseTTM: 8_000_000_000, effectiveTaxRate: 0.30,
  freeCashFlowTTM: 9_000_000_000, operatingCashFlowTTM: 12_000_000_000,
  capitalExpendituresTTM: 3_000_000_000, depreciationAmortizationTTM: 1_400_000_000,
  changeInWorkingCapitalTTM: -500_000_000,
  fcfHistory5Y: [6.5e9, 7.2e9, 7.9e9, 8.4e9, 9.0e9],
  dividendPerShare: 0.42, dividendGrowthRate5Y: 0.08, payoutRatio: 0.52,
  revenueGrowth5Y: 0.07, epsGrowth5Y: 0.10,
  beta: 1.05, riskFreeRate: 0.045, equityRiskPremium: 0.055, longTermGrowthRate: 0.025,
  analystTargetPrice: 7.10, analystTargetLow: 6.20, analystTargetHigh: 8.10,
  peers: [
    { ticker: "BBD",   sector: "Financials", peRatio: 7.2, evToEbitda: 4.8, pbRatio: 1.1, priceToSales: 1.0 },
    { ticker: "SAN",   sector: "Financials", peRatio: 8.1, evToEbitda: 5.2, pbRatio: 1.3, priceToSales: 1.2 },
    { ticker: "BBAS3", sector: "Financials", peRatio: 6.0, evToEbitda: 4.2, pbRatio: 0.9, priceToSales: 0.9 },
  ],
  source: "mock", asOf: new Date().toISOString(),
};
export const ITUB_SERIES = seriesFromCloses(
  "ITUB",
  Array.from({ length: 260 }, (_, i) => 4.5 + i * 0.006 + Math.sin(i / 12) * 0.2)
);

// Archetype 2: cyclical with volatile FCF — DCF works, dividends are fat
export const PBR_MOCK: Fundamentals = {
  ticker: "PBR", name: "Petrobras (mock)", sector: "Energy",
  currency: "USD", fiscalYearEnd: "12-31",
  currentPrice: 14.50, sharesOutstanding: 6_500_000_000,
  marketCap: 14.50 * 6_500_000_000,
  revenueTTM: 95_000_000_000, operatingIncomeTTM: 28_000_000_000,
  ebitdaTTM: 38_000_000_000, netIncomeTTM: 20_000_000_000,
  epsTTM: 3.08, epsForward: 2.60,
  totalDebt: 55_000_000_000, cashAndEquivalents: 18_000_000_000,
  totalEquity: 70_000_000_000, investedCapital: 130_000_000_000,
  interestExpenseTTM: 3_500_000_000, effectiveTaxRate: 0.34,
  freeCashFlowTTM: 18_000_000_000, operatingCashFlowTTM: 30_000_000_000,
  capitalExpendituresTTM: 12_000_000_000, depreciationAmortizationTTM: 10_000_000_000,
  changeInWorkingCapitalTTM: 1_000_000_000,
  fcfHistory5Y: [8e9, 15e9, 22e9, 19e9, 18e9],
  dividendPerShare: 2.30, dividendGrowthRate5Y: 0.15, payoutRatio: 0.75,
  revenueGrowth5Y: 0.04, epsGrowth5Y: 0.06,
  beta: 1.35, riskFreeRate: 0.045, equityRiskPremium: 0.055, longTermGrowthRate: 0.015,
  analystTargetPrice: 16.50, analystTargetLow: 12.00, analystTargetHigh: 21.00,
  peers: [
    { ticker: "XOM",  sector: "Energy", peRatio: 13.5, evToEbitda: 7.8, pbRatio: 2.0, priceToSales: 1.3 },
    { ticker: "CVX",  sector: "Energy", peRatio: 14.2, evToEbitda: 8.1, pbRatio: 2.1, priceToSales: 1.4 },
    { ticker: "SHEL", sector: "Energy", peRatio: 12.4, evToEbitda: 6.9, pbRatio: 1.6, priceToSales: 1.1 },
  ],
  source: "mock", asOf: new Date().toISOString(),
};
export const PBR_SERIES = seriesFromCloses(
  "PBR",
  Array.from({ length: 260 }, (_, i) => 10 + i * 0.015 + Math.sin(i / 8) * 1.5)
);

// Archetype 3: negative earnings, no dividend — most models n/a
export const NEG_MOCK: Fundamentals = {
  ticker: "GROW", name: "Growth Co (mock)", sector: "Technology",
  currency: "USD", fiscalYearEnd: "12-31",
  currentPrice: 45.00, sharesOutstanding: 500_000_000,
  marketCap: 45 * 500_000_000,
  revenueTTM: 2_000_000_000, operatingIncomeTTM: -150_000_000,
  ebitdaTTM: 50_000_000, netIncomeTTM: -220_000_000,
  epsTTM: -0.44, epsForward: -0.05,
  totalDebt: 400_000_000, cashAndEquivalents: 800_000_000,
  totalEquity: 1_500_000_000, investedCapital: 1_900_000_000,
  interestExpenseTTM: 20_000_000, effectiveTaxRate: 0.21,
  freeCashFlowTTM: -100_000_000, operatingCashFlowTTM: 150_000_000,
  capitalExpendituresTTM: 250_000_000, depreciationAmortizationTTM: 120_000_000,
  changeInWorkingCapitalTTM: -50_000_000,
  fcfHistory5Y: [-200e6, -150e6, -120e6, -110e6, -100e6],
  dividendPerShare: 0, dividendGrowthRate5Y: 0, payoutRatio: 0,
  revenueGrowth5Y: 0.25, epsGrowth5Y: -0.10,
  beta: 1.60, riskFreeRate: 0.045, equityRiskPremium: 0.055, longTermGrowthRate: 0.03,
  analystTargetPrice: 52.00, analystTargetLow: 38.00, analystTargetHigh: 70.00,
  peers: [
    { ticker: "PEER1", sector: "Technology", peRatio: 35.0, evToEbitda: 18.0, pbRatio: 4.0, priceToSales: 6.0 },
    { ticker: "PEER2", sector: "Technology", peRatio: 28.0, evToEbitda: 15.0, pbRatio: 3.5, priceToSales: 5.0 },
    { ticker: "PEER3", sector: "Technology", peRatio: 40.0, evToEbitda: 20.0, pbRatio: 5.0, priceToSales: 7.0 },
  ],
  source: "mock", asOf: new Date().toISOString(),
};
export const NEG_SERIES = seriesFromCloses(
  "GROW",
  Array.from({ length: 260 }, (_, i) => 30 + i * 0.05 + Math.sin(i / 10) * 3)
);

export const ALL_FIXTURES = {
  ITUB: { fundamentals: ITUB_MOCK, series: ITUB_SERIES },
  PBR:  { fundamentals: PBR_MOCK,  series: PBR_SERIES  },
  GROW: { fundamentals: NEG_MOCK,  series: NEG_SERIES  },
};
