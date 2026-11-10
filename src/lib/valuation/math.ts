export function median(values: number[]): number | null {
  const clean = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (clean.length === 0) return null;
  const mid = Math.floor(clean.length / 2);
  return clean.length % 2 === 0 ? (clean[mid - 1] + clean[mid]) / 2 : clean[mid];
}

export function costOfEquity(f: { riskFreeRate: number; beta: number; equityRiskPremium: number }) {
  return f.riskFreeRate + f.beta * f.equityRiskPremium;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function waccFor(f: {
  marketCap: number;
  totalDebt: number;
  interestExpenseTTM: number;
  effectiveTaxRate: number;
  riskFreeRate: number;
  beta: number;
  equityRiskPremium: number;
}): number {
  const E = f.marketCap;
  const D = f.totalDebt;
  const re = f.riskFreeRate + f.beta * f.equityRiskPremium;
  const rd = (f.interestExpenseTTM / Math.max(D, 1)) * (1 - f.effectiveTaxRate);
  return (E / (E + D)) * re + (D / (E + D)) * rd;
}
