import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { median } from "../math";

export function evEbitdaModel(f: Fundamentals): ModelResult {
  const meta = MODELS.ev_ebitda;
  if (f.sector === "Financials") {
    return { status: "n/a", modelId: "ev_ebitda", modelName: meta.name, category: meta.category,
      reason: "not_applicable_sector", detail: "EV/EBITDA is not meaningful for financials" };
  }
  if (f.ebitdaTTM <= 0) {
    return { status: "n/a", modelId: "ev_ebitda", modelName: meta.name, category: meta.category,
      reason: "negative_earnings", detail: `EBITDA ${f.ebitdaTTM} <= 0` };
  }
  const peerEv = median(f.peers.map((p) => p.evToEbitda ?? NaN));
  if (peerEv === null) {
    return { status: "n/a", modelId: "ev_ebitda", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "No valid peer EV/EBITDA multiples" };
  }
  const targetEv = peerEv * f.ebitdaTTM;
  const equity = targetEv - f.totalDebt + f.cashAndEquivalents;
  if (equity <= 0) {
    return { status: "n/a", modelId: "ev_ebitda", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: `Implied equity ${equity.toLocaleString()} <= 0` };
  }
  const fairValue = equity / f.sharesOutstanding;
  return { status: "ok", modelId: "ev_ebitda", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { peerEv, targetEv, equity }, asOf: f.asOf };
}
