import type { ModelResult, ConsensusFairValue } from "./types";

type Ok = Extract<ModelResult, { status: "ok" }>;

function weightedMedian(pairs: { value: number; weight: number }[]): number | null {
  if (pairs.length === 0) return null;
  const sorted = [...pairs].sort((a, b) => a.value - b.value);
  const total = sorted.reduce((s, p) => s + p.weight, 0);
  if (total <= 0) return null;
  let cum = 0;
  for (const p of sorted) {
    cum += p.weight;
    if (cum >= total / 2) return p.value;
  }
  return sorted[sorted.length - 1].value;
}

export function buildConsensus(results: ModelResult[], currentPrice: number): ConsensusFairValue {
  const ok = results.filter((r): r is Ok => r.status === "ok");
  const na = results.filter((r): r is Extract<ModelResult, { status: "n/a" }> => r.status === "n/a");

  const excluded = na.map((r) => ({ id: r.modelId, reason: r.reason }));
  const includedModels = ok.map((r) => r.modelId);

  if (ok.length === 0) {
    return {
      fairValue: 0, median: 0, mean: 0, stdDev: 0, spread: 0, certainty: "low",
      applicableCount: 0, totalCount: results.length, varianceVsPrice: 0,
      includedModels: [], excluded,
    };
  }

  const values = ok.map((r) => r.fairValue);
  const weights = ok.map((r) => r.confidence);

  const median = weightedMedian(values.map((value, i) => ({ value, weight: weights[i] }))) ?? 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = min > 0 ? max / min : 0;

  const clamped = Math.max(0.2 * currentPrice, Math.min(5 * currentPrice, median));
  const varianceVsPrice = currentPrice > 0 ? (clamped - currentPrice) / currentPrice : 0;

  const certainty: "high" | "medium" | "low" =
    spread <= 1.20 ? "high" : spread <= 1.75 ? "medium" : "low";

  return {
    fairValue: clamped, median, mean, stdDev, spread, certainty,
    applicableCount: ok.length, totalCount: results.length,
    varianceVsPrice, includedModels, excluded,
  };
}
