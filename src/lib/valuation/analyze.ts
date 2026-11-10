import type {
  Fundamentals, PriceSeries, ModelResult, ConsensusFairValue, HealthScore,
} from "./types";
import { runAllModels } from "./models";
import { buildConsensus } from "./consensus";
import { healthScore } from "./scoring";

export interface Analysis {
  results: ModelResult[];
  consensus: ConsensusFairValue;
  health: HealthScore;
}

export function analyze(f: Fundamentals, s: PriceSeries): Analysis {
  const results = runAllModels(f);
  const consensus = buildConsensus(results, f.currentPrice);
  const health = healthScore(f, s);
  return { results, consensus, health };
}
