import type { ModelId, ModelCategory } from "./types";

export interface ModelMeta {
  id: ModelId;
  name: string;
  category: ModelCategory;
  baseConfidence: number;
  description: string;
}

export const MODELS: Record<ModelId, ModelMeta> = {
  dcf:                 { id: "dcf",                 name: "DCF 5Y (Growth Exit)",        category: "cash_flow", baseConfidence: 0.75, description: "5Y FCF projection + Gordon Growth terminal value." },
  fcff:                { id: "fcff",                name: "Free Cash Flow to Firm",      category: "cash_flow", baseConfidence: 0.70, description: "FCFF discounted at WACC." },
  fcfe:                { id: "fcfe",                name: "Free Cash Flow to Equity",    category: "cash_flow", baseConfidence: 0.65, description: "FCFE discounted at cost of equity." },
  cap_earnings:        { id: "cap_earnings",        name: "Capitalization of Earnings",  category: "earnings",  baseConfidence: 0.60, description: "Stable earnings capitalized at a required return." },
  epv:                 { id: "epv",                 name: "Earnings Power Value",        category: "earnings",  baseConfidence: 0.70, description: "Adjusted earnings / cost of capital, no growth assumed." },
  residual_income:     { id: "residual_income",     name: "Residual Income",             category: "earnings",  baseConfidence: 0.65, description: "Book value + PV of residual income." },
  eva:                 { id: "eva",                 name: "Economic Value Added",        category: "earnings",  baseConfidence: 0.60, description: "Invested capital + PV of economic profit." },
  ddm:                 { id: "ddm",                 name: "Dividend Discount Model",     category: "dividend",  baseConfidence: 0.60, description: "PV of dividends discounted at cost of equity." },
  dividend_growth:     { id: "dividend_growth",     name: "Dividend Growth (Gordon)",    category: "dividend",  baseConfidence: 0.55, description: "D1 / (r − g)." },
  pe:                  { id: "pe",                  name: "P/E Multiple",                category: "multiple",  baseConfidence: 0.65, description: "Fair P/E × forward EPS." },
  ps:                  { id: "ps",                  name: "P/S Multiple",                category: "multiple",  baseConfidence: 0.55, description: "Fair P/S × revenue per share." },
  pb:                  { id: "pb",                  name: "P/B Multiple",                category: "multiple",  baseConfidence: 0.60, description: "Fair P/B × book value per share." },
  ev_ebitda:           { id: "ev_ebitda",           name: "EV/EBITDA Multiple",          category: "multiple",  baseConfidence: 0.70, description: "Fair EV/EBITDA × EBITDA, less net debt." },
  comps:               { id: "comps",               name: "Comparable Companies",        category: "multiple",  baseConfidence: 0.60, description: "Peer-median multiples applied to fundamentals." },
  sum_of_parts:        { id: "sum_of_parts",        name: "Sum of the Parts",            category: "asset",     baseConfidence: 0.50, description: "Segment-level valuation aggregated." },
  analyst_consensus:   { id: "analyst_consensus",   name: "Analyst Consensus Target",    category: "market",    baseConfidence: 0.70, description: "Mean of analyst price targets." },
  adjusted_net_assets: { id: "adjusted_net_assets", name: "Adjusted Net Assets",         category: "asset",     baseConfidence: 0.55, description: "Assets marked to fair value, less liabilities." },
  dcf_5y_revenue:      { id: "dcf_5y_revenue",      name: "DCF 5Y (Revenue Exit)",       category: "cash_flow", baseConfidence: 0.65, description: "5Y FCF projection, terminal value = revenue × peer EV/Revenue." },
  dcf_5y_ebitda:       { id: "dcf_5y_ebitda",       name: "DCF 5Y (EBITDA Exit)",        category: "cash_flow", baseConfidence: 0.70, description: "5Y FCF projection, terminal value = EBITDA × peer EV/EBITDA." },
  dcf_10y_growth:      { id: "dcf_10y_growth",      name: "DCF 10Y (Growth Exit)",       category: "cash_flow", baseConfidence: 0.72, description: "10Y FCF projection + Gordon Growth terminal value." },
  dcf_10y_revenue:     { id: "dcf_10y_revenue",     name: "DCF 10Y (Revenue Exit)",      category: "cash_flow", baseConfidence: 0.62, description: "10Y FCF projection, terminal value = revenue × peer EV/Revenue." },
  dcf_10y_ebitda:      { id: "dcf_10y_ebitda",      name: "DCF 10Y (EBITDA Exit)",       category: "cash_flow", baseConfidence: 0.68, description: "10Y FCF projection, terminal value = EBITDA × peer EV/EBITDA." },
  ev_ebit:             { id: "ev_ebit",             name: "EV/EBIT Multiple",            category: "multiple",  baseConfidence: 0.68, description: "Fair EV/EBIT × EBIT, less net debt." },
  dividend_multistage: { id: "dividend_multistage", name: "Dividend (Two-Stage)",        category: "dividend",  baseConfidence: 0.62, description: "5Y high-growth dividends + Gordon Growth terminal." },
};
