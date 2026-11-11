import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { median } from "../math";

export function evEbitModel(f: Fundamentals): ModelResult {
  const meta = MODELS.ev_ebit;
  if (f.sector === "Financials") {
    return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
      reason: "not_applicable_sector", detail: "EV/EBIT is not meaningful for financials" };
  }
  const ebit = f.operatingIncomeTTM;
  if (ebit <= 0) {
    return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
      reason: "negative_earnings", detail: `EBIT ${ebit.toLocaleString()} <= 0` };
  }
  const peerEvEbit = median(f.peers.map((p) => p.evToEbit ?? NaN));
  if (peerEvEbit === null) {
    return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "No peer EV/EBIT multiples available" };
  }
  const targetEv = peerEvEbit * ebit;
  const equity = targetEv - f.totalDebt + f.cashAndEquivalents;
  if (equity <= 0) {
    return { status: "n/a", modelId: meta.id, modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: `Implied equity ${equity.toLocaleString()} <= 0` };
  }
  const fairValue = equity / f.sharesOutstanding;
  return { status: "ok", modelId: meta.id, modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { ebit, peerEvEbit, targetEv, equity }, asOf: f.asOf };
}
