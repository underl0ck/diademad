import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { runDcf } from "./dcf-shared";

export function dcf5yEbitdaModel(f: Fundamentals): ModelResult {
  return runDcf(f, MODELS.dcf_5y_ebitda, { years: 5, terminalMethod: "ebitda" });
}
