import type { Fundamentals, ModelResult } from "../types";
import { MODELS } from "../registry";
import { runDcf } from "./dcf-shared";

export function dcf5yRevenueModel(f: Fundamentals): ModelResult {
  return runDcf(f, MODELS.dcf_5y_revenue, { years: 5, terminalMethod: "revenue" });
}
