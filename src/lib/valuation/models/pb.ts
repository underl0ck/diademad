import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { median } from "../math";

export function pbModel(f: Fundamentals): ModelResult {
  const meta = MODELS.pb;
  if (f.totalEquity <= 0) {
    return { status: "n/a", modelId: "pb", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: `Book equity ${f.totalEquity} <= 0` };
  }
  const peerPb = median(f.peers.map((p) => p.pbRatio ?? NaN));
  if (peerPb === null) {
    return { status: "n/a", modelId: "pb", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "No valid peer P/B multiples" };
  }
  const bvps = f.totalEquity / f.sharesOutstanding;
  const fairValue = peerPb * bvps;
  return { status: "ok", modelId: "pb", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { peerPb, bvps }, asOf: f.asOf };
}
