import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { costOfEquity } from "../math";

export function capEarningsModel(f: Fundamentals): ModelResult {
  const meta = MODELS.cap_earnings;
  if (f.epsTTM <= 0) {
    return { status: "n/a", modelId: "cap_earnings", modelName: meta.name, category: meta.category,
      reason: "negative_earnings", detail: `EPS ${f.epsTTM.toFixed(2)} <= 0` };
  }
  const r = costOfEquity(f);
  const fairValue = f.epsTTM / r;
  return { status: "ok", modelId: "cap_earnings", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { epsTTM: f.epsTTM, requiredReturn: r }, asOf: f.asOf };
}
