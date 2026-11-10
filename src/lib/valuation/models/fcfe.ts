import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { costOfEquity } from "../math";

export function fcfeModel(f: Fundamentals): ModelResult {
  const meta = MODELS.fcfe;
  const fcfe =
    f.netIncomeTTM +
    f.depreciationAmortizationTTM -
    f.capitalExpendituresTTM -
    f.changeInWorkingCapitalTTM;

  if (fcfe <= 0) {
    return { status: "n/a", modelId: "fcfe", modelName: meta.name, category: meta.category,
      reason: "negative_fcf", detail: `FCFE ${fcfe.toLocaleString()} <= 0` };
  }

  const r = costOfEquity(f);
  if (r <= f.longTermGrowthRate) {
    return { status: "n/a", modelId: "fcfe", modelName: meta.name, category: meta.category,
      reason: "growth_exceeds_discount_rate",
      detail: `r ${r.toFixed(4)} <= g ${f.longTermGrowthRate}` };
  }

  const g1 = Math.min(0.10, f.epsGrowth5Y);
  let pv = 0;
  let flow = fcfe;
  for (let t = 1; t <= 5; t++) {
    flow *= 1 + g1;
    pv += flow / Math.pow(1 + r, t);
  }
  const terminal = (flow * (1 + f.longTermGrowthRate)) / (r - f.longTermGrowthRate);
  const pvTerminal = terminal / Math.pow(1 + r, 5);
  const equity = pv + pvTerminal;
  const fairValue = equity / f.sharesOutstanding;

  return { status: "ok", modelId: "fcfe", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { fcfe, r, g1, g2: f.longTermGrowthRate, pv, pvTerminal }, asOf: f.asOf };
}
