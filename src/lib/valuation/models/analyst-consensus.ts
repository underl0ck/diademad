import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";

export function analystConsensusModel(f: Fundamentals): ModelResult {
  const meta = MODELS.analyst_consensus;
  if (f.analystTargetPrice === null || f.analystTargetPrice <= 0) {
    return { status: "n/a", modelId: "analyst_consensus", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "No analyst target price available" };
  }
  let confidence = meta.baseConfidence;
  if (f.analystTargetLow !== null && f.analystTargetHigh !== null && f.analystTargetPrice > 0) {
    const range = (f.analystTargetHigh - f.analystTargetLow) / f.analystTargetPrice;
    confidence = Math.min(0.95, Math.max(0.5, 1 - range * 0.5));
  }
  return { status: "ok", modelId: "analyst_consensus", modelName: meta.name, category: meta.category,
    fairValue: f.analystTargetPrice, confidence,
    inputs: {
      target: f.analystTargetPrice,
      low: f.analystTargetLow ?? f.analystTargetPrice,
      high: f.analystTargetHigh ?? f.analystTargetPrice,
    }, asOf: f.asOf };
}
