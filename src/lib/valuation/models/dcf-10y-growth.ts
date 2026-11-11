import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { runDcf } from "./dcf-shared";

export function dcf10yGrowthModel(f: Fundamentals): ModelResult {
  return runDcf(f, MODELS.dcf_10y_growth, { years: 10, terminalMethod: "growth" });
}
