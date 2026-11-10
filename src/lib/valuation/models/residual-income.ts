import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { costOfEquity } from "../math";

export function residualIncomeModel(f: Fundamentals): ModelResult {
  const meta = MODELS.residual_income;
  if (f.totalEquity <= 0) {
    return { status: "n/a", modelId: "residual_income", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: `Book equity ${f.totalEquity} <= 0` };
  }
  if (f.netIncomeTTM <= 0) {
    return { status: "n/a", modelId: "residual_income", modelName: meta.name, category: meta.category,
      reason: "negative_earnings", detail: `Net income ${f.netIncomeTTM.toLocaleString()} <= 0` };
  }
  const r = costOfEquity(f);
  const ri = f.netIncomeTTM - r * f.totalEquity;
  if (ri <= 0) {
    return { status: "n/a", modelId: "residual_income", modelName: meta.name, category: meta.category,
      reason: "negative_earnings", detail: `Residual income ${ri.toLocaleString()} <= 0` };
  }
  const pvRi = ri / r;
  const totalValue = f.totalEquity + pvRi;
  const fairValue = totalValue / f.sharesOutstanding;
  return { status: "ok", modelId: "residual_income", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { netIncome: f.netIncomeTTM, bookEquity: f.totalEquity, ri, r, pvRi }, asOf: f.asOf };
}
