import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";

export function adjustedNetAssetsModel(f: Fundamentals): ModelResult {
  const meta = MODELS.adjusted_net_assets;
  if (f.totalEquity <= 0) {
    return { status: "n/a", modelId: "adjusted_net_assets", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: `Book equity ${f.totalEquity} <= 0` };
  }
  const bvps = f.totalEquity / f.sharesOutstanding;
  // 10% haircut for typical intangible overstatement in book values.
  const fairValue = bvps * 0.9;
  return { status: "ok", modelId: "adjusted_net_assets", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { bvps, haircut: 0.1 }, asOf: f.asOf };
}
