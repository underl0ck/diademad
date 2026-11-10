import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { waccFor } from "../math";

export function fcffModel(f: Fundamentals): ModelResult {
  const meta = MODELS.fcff;
  const fcff =
    f.operatingCashFlowTTM +
    f.interestExpenseTTM * (1 - f.effectiveTaxRate) -
    f.capitalExpendituresTTM;

  if (fcff <= 0) {
    return { status: "n/a", modelId: "fcff", modelName: meta.name, category: meta.category,
      reason: "negative_fcf", detail: `FCFF ${fcff.toLocaleString()} <= 0` };
  }

  const discount = waccFor(f);
  if (discount <= f.longTermGrowthRate) {
    return { status: "n/a", modelId: "fcff", modelName: meta.name, category: meta.category,
      reason: "growth_exceeds_discount_rate",
      detail: `WACC ${discount.toFixed(4)} <= g ${f.longTermGrowthRate}` };
  }

  const g1 = Math.min(0.10, f.revenueGrowth5Y);
  let pv = 0;
  let flow = fcff;
  for (let t = 1; t <= 5; t++) {
    flow *= 1 + g1;
    pv += flow / Math.pow(1 + discount, t);
  }
  const terminal = (flow * (1 + f.longTermGrowthRate)) / (discount - f.longTermGrowthRate);
  const pvTerminal = terminal / Math.pow(1 + discount, 5);
  const equity = pv + pvTerminal - f.totalDebt + f.cashAndEquivalents;
  const fairValue = equity / f.sharesOutstanding;

  return { status: "ok", modelId: "fcff", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { fcff, wacc: discount, g1, g2: f.longTermGrowthRate, pv, pvTerminal },
    asOf: f.asOf };
}
