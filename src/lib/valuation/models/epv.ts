import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { waccFor } from "../math";

export function epvModel(f: Fundamentals): ModelResult {
  const meta = MODELS.epv;
  if (f.operatingIncomeTTM <= 0) {
    return { status: "n/a", modelId: "epv", modelName: meta.name, category: meta.category,
      reason: "negative_earnings", detail: `Operating income ${f.operatingIncomeTTM.toLocaleString()} <= 0` };
  }
  const discount = waccFor(f);
  if (discount <= 0) {
    return { status: "n/a", modelId: "epv", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "WACC must be positive" };
  }
  const nopat = f.operatingIncomeTTM * (1 - f.effectiveTaxRate);
  const ev = nopat / discount;
  const equity = ev - f.totalDebt + f.cashAndEquivalents;
  const fairValue = equity / f.sharesOutstanding;
  return { status: "ok", modelId: "epv", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { nopat, wacc: discount, ev }, asOf: f.asOf };
}
