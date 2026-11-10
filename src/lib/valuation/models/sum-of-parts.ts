import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { median } from "../math";

export function sumOfPartsModel(f: Fundamentals): ModelResult {
  const meta = MODELS.sum_of_parts;
  if (f.sector === "Financials") {
    return { status: "n/a", modelId: "sum_of_parts", modelName: meta.name, category: meta.category,
      reason: "not_applicable_sector", detail: "Segment/EV decomposition is not meaningful for financials" };
  }
  if (f.ebitdaTTM <= 0) {
    return { status: "n/a", modelId: "sum_of_parts", modelName: meta.name, category: meta.category,
      reason: "negative_earnings", detail: `EBITDA ${f.ebitdaTTM} <= 0` };
  }
  const peerEv = median(f.peers.map((p) => p.evToEbitda ?? NaN));
  if (peerEv === null) {
    return { status: "n/a", modelId: "sum_of_parts", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "No peer EV/EBITDA available" };
  }
  // Approximation without segment data: operating business valued at peer EV/EBITDA,
  // plus excess cash above 2% of revenue (treated as non-operating).
  const operatingEv = peerEv * f.ebitdaTTM;
  const normalizedCash = 0.02 * f.revenueTTM;
  const excessCash = Math.max(0, f.cashAndEquivalents - normalizedCash);
  const equity = operatingEv + excessCash - f.totalDebt;
  if (equity <= 0) {
    return { status: "n/a", modelId: "sum_of_parts", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: `Implied equity ${equity.toLocaleString()} <= 0` };
  }
  const fairValue = equity / f.sharesOutstanding;
  return { status: "ok", modelId: "sum_of_parts", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { peerEv, operatingEv, excessCash, equity }, asOf: f.asOf };
}
