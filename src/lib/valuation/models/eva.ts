import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { waccFor } from "../math";

export function evaModel(f: Fundamentals): ModelResult {
  const meta = MODELS.eva;
  if (f.investedCapital <= 0) {
    return { status: "n/a", modelId: "eva", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: `Invested capital ${f.investedCapital} <= 0` };
  }
  const wacc = waccFor(f);
  const nopat = f.operatingIncomeTTM * (1 - f.effectiveTaxRate);
  const eva = nopat - wacc * f.investedCapital;
  if (eva <= 0) {
    return { status: "n/a", modelId: "eva", modelName: meta.name, category: meta.category,
      reason: "negative_earnings", detail: `EVA ${eva.toLocaleString()} <= 0 (ROIC below WACC)` };
  }
  const g = Math.min(f.longTermGrowthRate, wacc - 0.005);
  if (wacc <= g) {
    return { status: "n/a", modelId: "eva", modelName: meta.name, category: meta.category,
      reason: "growth_exceeds_discount_rate", detail: `WACC ${wacc.toFixed(4)} <= g ${g}` };
  }
  const pvEva = eva / (wacc - g);
  const ev = f.investedCapital + pvEva;
  const equity = ev - f.totalDebt + f.cashAndEquivalents;
  const fairValue = equity / f.sharesOutstanding;
  return { status: "ok", modelId: "eva", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { nopat, wacc, eva, pvEva, g }, asOf: f.asOf };
}
