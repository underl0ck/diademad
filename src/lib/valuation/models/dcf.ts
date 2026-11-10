import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { costOfEquity } from "../math";

function wacc(f: Fundamentals): number {
  const E = f.marketCap;
  const D = f.totalDebt;
  const re = costOfEquity(f);
  const rd = (f.interestExpenseTTM / Math.max(D, 1)) * (1 - f.effectiveTaxRate);
  return (E / (E + D)) * re + (D / (E + D)) * rd;
}

export function dcfModel(f: Fundamentals): ModelResult {
  const meta = MODELS.dcf;
  if (f.freeCashFlowTTM <= 0) {
    return { status: "n/a", modelId: "dcf", modelName: meta.name, category: meta.category,
      reason: "negative_fcf", detail: `FCF ${f.freeCashFlowTTM.toLocaleString()} <= 0` };
  }
  const discount = wacc(f);
  if (discount <= f.longTermGrowthRate) {
    return { status: "n/a", modelId: "dcf", modelName: meta.name, category: meta.category,
      reason: "growth_exceeds_discount_rate",
      detail: `WACC ${discount.toFixed(3)} <= terminal g ${f.longTermGrowthRate}` };
  }

  const g1 = Math.min(0.10, f.revenueGrowth5Y);
  let pvExplicit = 0;
  let fcf = f.freeCashFlowTTM;
  for (let t = 1; t <= 5; t++) {
    fcf *= 1 + g1;
    pvExplicit += fcf / Math.pow(1 + discount, t);
  }
  const terminalFcf = (fcf * (1 + f.longTermGrowthRate)) / (discount - f.longTermGrowthRate);
  const pvTerminal = terminalFcf / Math.pow(1 + discount, 5);
  const equityValue = pvExplicit + pvTerminal - f.totalDebt + f.cashAndEquivalents;
  const fairValue = equityValue / f.sharesOutstanding;

  return { status: "ok", modelId: "dcf", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: {
      fcfTTM: f.freeCashFlowTTM, wacc: discount, g1, g2: f.longTermGrowthRate,
      pvExplicit, pvTerminal, equityValue,
    }, asOf: f.asOf };
}
