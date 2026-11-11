import type { Fundamentals, ModelResult } from "../types";
import { median, waccFor } from "../math";
import type { ModelMeta } from "../registry";

export type TerminalMethod = "growth" | "revenue" | "ebitda";
export interface DcfConfig { years: 5 | 10; terminalMethod: TerminalMethod; }

export function runDcf(f: Fundamentals, meta: ModelMeta, config: DcfConfig): ModelResult {
  if (f.freeCashFlowTTM <= 0) {
    return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
      reason: "negative_fcf", detail: `FCF ${f.freeCashFlowTTM.toLocaleString()} <= 0` };
  }
  const discount = waccFor(f);
  if (discount <= f.longTermGrowthRate) {
    return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
      reason: "growth_exceeds_discount_rate",
      detail: `WACC ${discount.toFixed(4)} <= g ${f.longTermGrowthRate}` };
  }

  const g1 = Math.min(0.10, f.revenueGrowth5Y);
  let fcf = f.freeCashFlowTTM;
  let revenue = f.revenueTTM;
  let ebitda = f.ebitdaTTM;
  let pvExplicit = 0;
  for (let t = 1; t <= config.years; t++) {
    fcf *= 1 + g1; revenue *= 1 + g1; ebitda *= 1 + g1;
    pvExplicit += fcf / Math.pow(1 + discount, t);
  }

  const inputs: Record<string, number> = {
    years: config.years, fcfTTM: f.freeCashFlowTTM, wacc: discount, g1, pvExplicit,
  };
  let terminalValue: number;
  if (config.terminalMethod === "growth") {
    terminalValue = (fcf * (1 + f.longTermGrowthRate)) / (discount - f.longTermGrowthRate);
    inputs.g2 = f.longTermGrowthRate;
    inputs.fcfTerminal = fcf;
  } else if (config.terminalMethod === "revenue") {
    const peerEvRevenue = median(f.peers.map((p) => p.evToRevenue ?? NaN));
    if (peerEvRevenue === null) {
      return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
        reason: "missing_inputs", detail: "No peer EV/Revenue multiples available" };
    }
    terminalValue = revenue * peerEvRevenue;
    inputs.peerEvRevenue = peerEvRevenue;
    inputs.terminalRevenue = revenue;
  } else {
    const peerEvEbitda = median(f.peers.map((p) => p.evToEbitda ?? NaN));
    if (peerEvEbitda === null) {
      return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
        reason: "missing_inputs", detail: "No peer EV/EBITDA multiples available" };
    }
    terminalValue = ebitda * peerEvEbitda;
    inputs.peerEvEbitda = peerEvEbitda;
    inputs.terminalEbitda = ebitda;
  }

  const pvTerminal = terminalValue / Math.pow(1 + discount, config.years);
  const enterpriseValue = pvExplicit + pvTerminal;
  const equityValue = enterpriseValue - f.totalDebt + f.cashAndEquivalents;
  const fairValue = equityValue / f.sharesOutstanding;

  inputs.terminalValue = terminalValue;
  inputs.pvTerminal = pvTerminal;
  inputs.enterpriseValue = enterpriseValue;
  inputs.equityValue = equityValue;

  return { status: "ok", modelId: meta.id, modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence, inputs, asOf: f.asOf };
}
