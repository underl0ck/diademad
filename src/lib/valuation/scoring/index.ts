import type { Fundamentals, PriceSeries, HealthScore, SubScore } from "../types";
import { clamp, median } from "../math";

const WEIGHTS = {
  momentum: 0.20,
  growth: 0.20,
  profitability: 0.20,
  cashFlow: 0.20,
  relativeValue: 0.20,
} as const;

function momentumScore(s: PriceSeries): SubScore {
  const closes = s.points.map((p) => p.close);
  const n = closes.length;
  const last = closes[n - 1] ?? 0;
  const at = (k: number) => (n >= k ? closes[n - k] : closes[0]);
  const ret3M = at(13) > 0 ? (last - at(13)) / at(13) : 0;
  const ret6M = at(26) > 0 ? (last - at(26)) / at(26) : 0;
  const ret12M = at(52) > 0 ? (last - at(52)) / at(52) : 0;
  const sma52 = n >= 52 ? closes.slice(-52).reduce((a, b) => a + b, 0) / 52 : last;
  const aboveSma = last > sma52 ? 1 : 0;

  const s3 = clamp(((ret3M + 0.15) / 0.30) * 100, 0, 100);
  const s6 = clamp(((ret6M + 0.20) / 0.40) * 100, 0, 100);
  const s12 = clamp(((ret12M + 0.30) / 0.60) * 100, 0, 100);
  const sSma = aboveSma * 100;

  const value = s3 * 0.20 + s6 * 0.20 + s12 * 0.30 + sSma * 0.30;
  return { value, weight: WEIGHTS.momentum, inputs: { ret3M, ret6M, ret12M, sma52, aboveSma } };
}

function growthScore(f: Fundamentals): SubScore {
  const fwdGrowth =
    f.epsForward !== null && f.epsTTM > 0 ? (f.epsForward - f.epsTTM) / f.epsTTM : null;

  const sRev = clamp(((f.revenueGrowth5Y + 0.05) / 0.30) * 100, 0, 100);
  const sEps = clamp(((f.epsGrowth5Y + 0.05) / 0.30) * 100, 0, 100);
  const sFwd = fwdGrowth !== null ? clamp(((fwdGrowth + 0.10) / 0.40) * 100, 0, 100) : 50;

  const value = sRev * 0.40 + sEps * 0.40 + sFwd * 0.20;
  return {
    value, weight: WEIGHTS.growth,
    inputs: { revenueGrowth5Y: f.revenueGrowth5Y, epsGrowth5Y: f.epsGrowth5Y, fwdGrowth: fwdGrowth ?? -1 },
  };
}

function profitabilityScore(f: Fundamentals): SubScore {
  const opMargin = f.revenueTTM > 0 ? f.operatingIncomeTTM / f.revenueTTM : 0;
  const roic = f.investedCapital > 0 ? f.netIncomeTTM / f.investedCapital : 0;

  const sMargin = clamp(((opMargin + 0.05) / 0.35) * 100, 0, 100);
  const sRoic = clamp(((roic + 0.02) / 0.20) * 100, 0, 100);

  const value = sMargin * 0.50 + sRoic * 0.50;
  return { value, weight: WEIGHTS.profitability, inputs: { opMargin, roic } };
}

function cashFlowScore(f: Fundamentals): SubScore {
  const fcfMargin = f.revenueTTM > 0 ? f.freeCashFlowTTM / f.revenueTTM : 0;
  const fcfConversion = f.netIncomeTTM !== 0 ? f.freeCashFlowTTM / f.netIncomeTTM : 0;

  const mean = f.fcfHistory5Y.reduce((a, b) => a + b, 0) / f.fcfHistory5Y.length;
  const variance =
    f.fcfHistory5Y.reduce((s, v) => s + (v - mean) ** 2, 0) / f.fcfHistory5Y.length;
  const stddev = Math.sqrt(variance);
  const cv = mean !== 0 ? stddev / Math.abs(mean) : 1;

  const sMargin = clamp(((fcfMargin + 0.05) / 0.30) * 100, 0, 100);
  const sConv = clamp(((fcfConversion + 0.20) / 1.20) * 100, 0, 100);
  const sStab = clamp((1 - cv) * 100, 0, 100);

  const value = sMargin * 0.35 + sConv * 0.35 + sStab * 0.30;
  return {
    value, weight: WEIGHTS.cashFlow,
    inputs: { fcfMargin, fcfConversion, fcfCv: cv },
  };
}

function relativeValueScore(f: Fundamentals): SubScore {
  const pe = f.epsTTM > 0 ? f.currentPrice / f.epsTTM : null;
  const pePeer = median(f.peers.map((p) => p.peRatio ?? NaN));

  const pb = f.totalEquity > 0 ? f.marketCap / f.totalEquity : null;
  const pbPeer = median(f.peers.map((p) => p.pbRatio ?? NaN));

  const ev = f.marketCap + f.totalDebt - f.cashAndEquivalents;
  const evEbitda = f.ebitdaTTM > 0 ? ev / f.ebitdaTTM : null;
  const evPeer = median(f.peers.map((p) => p.evToEbitda ?? NaN));

  const sPe = pe && pePeer ? clamp((pePeer / pe) * 50, 0, 100) : 50;
  const sPb = pb && pbPeer ? clamp((pbPeer / pb) * 50, 0, 100) : 50;
  const sEv = evEbitda && evPeer ? clamp((evPeer / evEbitda) * 50, 0, 100) : 50;

  const value = sPe * 0.40 + sPb * 0.30 + sEv * 0.30;
  return {
    value, weight: WEIGHTS.relativeValue,
    inputs: {
      pe: pe ?? -1, pePeer: pePeer ?? -1,
      pb: pb ?? -1, pbPeer: pbPeer ?? -1,
      evEbitda: evEbitda ?? -1, evPeer: evPeer ?? -1,
    },
  };
}

export function healthScore(f: Fundamentals, s: PriceSeries): HealthScore {
  const momentum = momentumScore(s);
  const growth = growthScore(f);
  const profitability = profitabilityScore(f);
  const cashFlow = cashFlowScore(f);
  const relativeValue = relativeValueScore(f);

  const composite =
    momentum.value * momentum.weight +
    growth.value * growth.weight +
    profitability.value * profitability.weight +
    cashFlow.value * cashFlow.weight +
    relativeValue.value * relativeValue.weight;

  return { composite, momentum, growth, profitability, cashFlow, relativeValue };
}
