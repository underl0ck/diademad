import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { median } from "../math";

export function psModel(f: Fundamentals): ModelResult {
  const meta = MODELS.ps;
  if (f.revenueTTM <= 0) {
    return { status: "n/a", modelId: "ps", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: `Revenue ${f.revenueTTM} <= 0` };
  }
  const peerPs = median(f.peers.map((p) => p.priceToSales ?? NaN));
  if (peerPs === null) {
    return { status: "n/a", modelId: "ps", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "No valid peer P/S multiples" };
  }
  const revenuePerShare = f.revenueTTM / f.sharesOutstanding;
  const fairValue = peerPs * revenuePerShare;
  return { status: "ok", modelId: "ps", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { peerPs, revenuePerShare }, asOf: f.asOf };
}
