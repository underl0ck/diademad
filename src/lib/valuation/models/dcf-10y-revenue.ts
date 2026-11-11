import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { runDcf } from "./dcf-shared";

export function dcf10yRevenueModel(f: Fundamentals): ModelResult {
  return runDcf(f, MODELS.dcf_10y_revenue, { years: 10, terminalMethod: "revenue" });
}
