export type DataSource = "fmp" | "yahoo" | "mock";
export type AsOf = string;

export type ModelCategory =
  | "cash_flow" | "earnings" | "dividend"
  | "multiple" | "asset" | "market";

export type ModelId =
  | "dcf" | "fcff" | "fcfe" | "cap_earnings" | "epv" | "residual_income" | "eva"
  | "ddm" | "dividend_growth"
  | "pe" | "ps" | "pb" | "ev_ebitda" | "comps"
  | "sum_of_parts" | "analyst_consensus" | "adjusted_net_assets";

export type NaReason =
  | "negative_earnings" | "no_dividend" | "negative_fcf"
  | "growth_exceeds_discount_rate" | "insufficient_history"
  | "missing_inputs" | "not_applicable_sector";

export type ModelResult =
  | {
      status: "ok";
      modelId: ModelId;
      modelName: string;
      category: ModelCategory;
      fairValue: number;
      confidence: number;
      inputs: Record<string, number>;
      asOf: AsOf;
    }
  | {
      status: "n/a";
      modelId: ModelId;
      modelName: string;
      category: ModelCategory;
      reason: NaReason;
      detail: string;
    };

export interface PeerMetrics {
  ticker: string;
  sector: string;
  peRatio: number | null;
  evToEbitda: number | null;
  pbRatio: number | null;
  priceToSales: number | null;
}

export interface Fundamentals {
  ticker: string;
  name: string;
  sector: string;
  currency: string;
  fiscalYearEnd: string;

  currentPrice: number;
  sharesOutstanding: number;
  marketCap: number;

  revenueTTM: number;
  operatingIncomeTTM: number;
  ebitdaTTM: number;
  netIncomeTTM: number;
  epsTTM: number;
  epsForward: number | null;

  totalDebt: number;
  cashAndEquivalents: number;
  totalEquity: number;
  investedCapital: number;
  interestExpenseTTM: number;
  effectiveTaxRate: number;

  freeCashFlowTTM: number;
  operatingCashFlowTTM: number;
  capitalExpendituresTTM: number;
  depreciationAmortizationTTM: number;
  changeInWorkingCapitalTTM: number;
  fcfHistory5Y: number[];

  dividendPerShare: number;
  dividendGrowthRate5Y: number;
  payoutRatio: number;

  revenueGrowth5Y: number;
  epsGrowth5Y: number;

  beta: number;
  riskFreeRate: number;
  equityRiskPremium: number;
  longTermGrowthRate: number;

  analystTargetPrice: number | null;
  analystTargetLow: number | null;
  analystTargetHigh: number | null;

  peers: PeerMetrics[];

  source: DataSource;
  asOf: AsOf;
}

export interface Quote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  asOf: AsOf;
  source: DataSource;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceSeries {
  ticker: string;
  points: PricePoint[];
  asOf: AsOf;
  source: DataSource;
}

export interface SubScore {
  value: number;
  inputs: Record<string, number>;
  weight: number;
}

export interface HealthScore {
  composite: number;
  momentum: SubScore;
  growth: SubScore;
  profitability: SubScore;
  cashFlow: SubScore;
  relativeValue: SubScore;
}

export interface ConsensusFairValue {
  fairValue: number;
  median: number;
  mean: number;
  stdDev: number;
  spread: number;
  applicableCount: number;
  totalCount: number;
  varianceVsPrice: number;
  includedModels: ModelId[];
  excluded: Array<{ id: ModelId; reason: NaReason }>;
}
