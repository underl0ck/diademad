import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { costOfEquity } from "../math";

export function dividendGrowthModel(f: Fundamentals): ModelResult {
  const meta = MODELS.dividend_growth;
  if (f.dividendPerShare <= 0) {
    return { status: "n/a", modelId: "dividend_growth", modelName: meta.name, category: meta.category,
      reason: "no_dividend", detail: "Company does not pay a dividend" };
  }
  const r = costOfEquity(f);
  // Conservative forward growth, capped at long-term rate.
  const g = Math.min(f.longTermGrowthRate, 0.04);
  if (r <= g) {
    return { status: "n/a", modelId: "dividend_growth", modelName: meta.name, category: meta.category,
      reason: "growth_exceeds_discount_rate", detail: `r ${r.toFixed(4)} <= g ${g}` };
  }
  const d1 = f.dividendPerShare * (1 + g);
  const fairValue = d1 / (r - g);
  return { status: "ok", modelId: "dividend_growth", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { dps: f.dividendPerShare, d1, r, g }, asOf: f.asOf };
}
