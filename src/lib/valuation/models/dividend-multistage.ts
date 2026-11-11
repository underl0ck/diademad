import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { costOfEquity } from "../math";

export function dividendMultistageModel(f: Fundamentals): ModelResult {
  const meta = MODELS.dividend_multistage;
  if (f.dividendPerShare <= 0) {
    return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
      reason: "no_dividend", detail: "Company does not pay a dividend" };
  }
  const r = costOfEquity(f);
  const g1 = Math.min(f.dividendGrowthRate5Y, 0.15);
  const g2 = Math.min(f.longTermGrowthRate, 0.04);
  if (r <= g2) {
    return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
      reason: "growth_exceeds_discount_rate", detail: `r ${r.toFixed(4)} <= g2 ${g2}` };
  }
  const stage1Years = 5;
  let pvStage1 = 0;
  let dividend = f.dividendPerShare;
  for (let t = 1; t <= stage1Years; t++) {
    dividend *= 1 + g1;
    pvStage1 += dividend / Math.pow(1 + r, t);
  }
  const d6 = dividend * (1 + g2);
  const pvTerminal = (d6 / (r - g2)) / Math.pow(1 + r, stage1Years);
  const fairValue = pvStage1 + pvTerminal;
  return { status: "ok", modelId: meta.id, modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { dps: f.dividendPerShare, g1, g2, r, pvStage1, pvTerminal, stage1Years }, asOf: f.asOf };
}
