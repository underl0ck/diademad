import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { median } from "../math";

export function compsModel(f: Fundamentals): ModelResult {
  const meta = MODELS.comps;
  const pieces: number[] = [];
  const inputs: Record<string, number> = {};

  if (f.epsTTM > 0) {
    const pePeer = median(f.peers.map((p) => p.peRatio ?? NaN));
    if (pePeer !== null) {
      const v = f.epsTTM * pePeer;
      pieces.push(v);
      inputs.fvPE = v;
    }
  }

  if (f.revenueTTM > 0) {
    const psPeer = median(f.peers.map((p) => p.priceToSales ?? NaN));
    if (psPeer !== null) {
      const v = (psPeer * f.revenueTTM) / f.sharesOutstanding;
      pieces.push(v);
      inputs.fvPS = v;
    }
  }

  if (f.totalEquity > 0) {
    const pbPeer = median(f.peers.map((p) => p.pbRatio ?? NaN));
    if (pbPeer !== null) {
      const v = (pbPeer * f.totalEquity) / f.sharesOutstanding;
      pieces.push(v);
      inputs.fvPB = v;
    }
  }

  if (f.sector !== "Financials" && f.ebitdaTTM > 0) {
    const evPeer = median(f.peers.map((p) => p.evToEbitda ?? NaN));
    if (evPeer !== null) {
      const ev = evPeer * f.ebitdaTTM;
      const v = (ev - f.totalDebt + f.cashAndEquivalents) / f.sharesOutstanding;
      if (v > 0) {
        pieces.push(v);
        inputs.fvEV = v;
      }
    }
  }

  if (pieces.length === 0) {
    return { status: "n/a", modelId: "comps", modelName: meta.name, category: meta.category,
      reason: "missing_inputs", detail: "No peer multiples produced a valid fair value" };
  }

  const fairValue = pieces.reduce((a, b) => a + b, 0) / pieces.length;
  return { status: "ok", modelId: "comps", modelName: meta.name, category: meta.category,
    fairValue, confidence: meta.baseConfidence,
    inputs: { ...inputs, pieces: pieces.length }, asOf: f.asOf };
}
