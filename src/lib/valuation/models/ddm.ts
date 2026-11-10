import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { costOfEquity } from "../math";

export function ddmModel(f: Fundamentals): ModelResult {
  const meta = MODELS.ddm;
  if (f.dividendPerShare <= 0) {
    return { status: "n/a", modelId: "ddm", modelName: meta.name, category: meta.category,
      reason: "no_dividend", detail: "Company does not pay a dividend" };
  }
  const r = costOfEquity(f);
  // v1: cap perpetual growth at 5%. Day 3 will replace this with a two-stage model.
  const g = Math.min(f.dividendGrowthRate5Y, 0.05);
  if (r - g <= 0) {
    return { status: "n/a", modelId: "ddm", modelName: meta.name, category: meta.category,
      reason: "growth_exceeds_discount_rate", detail: `r=${r.toFixed(3)} <= g=${g.toFixed(3)}` };
  }
  const d1 = f.dividendPerShare * (1 + g);
  const fairValue = d1 / (r - g);
  return { status: "ok", modelId: "ddm", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { dps: f.dividendPerShare, d1, r, g }, asOf: f.asOf };
}
