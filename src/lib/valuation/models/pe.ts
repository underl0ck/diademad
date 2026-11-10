import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { median } from "../math";

export function peModel(f: Fundamentals): ModelResult {
  const meta = MODELS.pe;
  if (f.epsForward === null) {
    return { status: "n/a", modelId: "pe", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "Forward EPS not available" };
  }
  if (f.epsForward <= 0) {
    return { status: "n/a", modelId: "pe", modelName: meta.name, category: meta.category,
      reason: "negative_earnings", detail: `Forward EPS ${f.epsForward.toFixed(2)} <= 0` };
  }
  const peerMedianPE = median(f.peers.map((p) => p.peRatio ?? NaN));
  if (peerMedianPE === null) {
    return { status: "n/a", modelId: "pe", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "No valid peer P/E multiples" };
  }
  const fairValue = f.epsForward * peerMedianPE;
  return { status: "ok", modelId: "pe", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { epsForward: f.epsForward, peerMedianPE }, asOf: f.asOf };
}
