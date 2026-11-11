import { describe, it, expect } from "vitest";
import { runAllModels } from "../models";
import { buildConsensus } from "../consensus";
import { MODELS } from "../registry";
import { ITUB_MOCK, NEG_MOCK } from "../../mock/fundamentals";

const ITUB_WITH_PEERS = {
  ...ITUB_MOCK,
  peers: ITUB_MOCK.peers.map((p) => ({
    ...p,
    evToRevenue: (p.priceToSales ?? 1) + 0.3,
    evToEbit: 12,
  })),
  sector: "Industrials", // unlock EV/EBIT and DCF sector gates if any
};

describe("extended model set", () => {
  it("registers 24 models", () => {
    expect(Object.keys(MODELS)).toHaveLength(24);
  });

  it("runAllModels returns one result per registered model", () => {
    const results = runAllModels(ITUB_WITH_PEERS);
    expect(results).toHaveLength(24);
    expect(results.map((r) => r.modelId).sort()).toEqual(Object.keys(MODELS).sort());
  });

  it("new DCF variants compute when peer metrics are available", () => {
    const results = runAllModels(ITUB_WITH_PEERS);
    const newDcfs = results.filter((r) =>
      ["dcf_5y_revenue", "dcf_5y_ebitda", "dcf_10y_growth",
       "dcf_10y_revenue", "dcf_10y_ebitda"].includes(r.modelId)
    );
    for (const r of newDcfs) {
      expect(r.status).toBe("ok");
      if (r.status === "ok") expect(r.fairValue).toBeGreaterThan(0);
    }
  });

  it("new DCF variants return n/a with missing_inputs when peer EV/Revenue absent", () => {
    // ITUB_MOCK's peers lack evToRevenue -> revenue-exit variants return n/a
    const results = runAllModels(ITUB_MOCK);
    for (const id of ["dcf_5y_revenue", "dcf_10y_revenue"] as const) {
      const r = results.find((x) => x.modelId === id)!;
      expect(r.status).toBe("n/a");
      if (r.status === "n/a") expect(r.reason).toBe("missing_inputs");
    }
  });

  it("ev_ebit returns n/a for financials", () => {
    const r = runAllModels(ITUB_MOCK).find((x) => x.modelId === "ev_ebit")!;
    expect(r.status).toBe("n/a");
    if (r.status === "n/a") expect(r.reason).toBe("not_applicable_sector");
  });

  it("dividend_multistage computes for ITUB and returns n/a for no-dividend name", () => {
    const itub = runAllModels(ITUB_MOCK).find((x) => x.modelId === "dividend_multistage")!;
    const neg = runAllModels(NEG_MOCK).find((x) => x.modelId === "dividend_multistage")!;
    expect(itub.status).toBe("ok");
    expect(neg.status).toBe("n/a");
    if (neg.status === "n/a") expect(neg.reason).toBe("no_dividend");
  });
});

describe("consensus certainty", () => {
  it("labels high certainty when models cluster tightly", () => {
    const base = 100;
    const fake = [
      { status: "ok" as const, modelId: "dcf" as const, modelName: "a", category: "cash_flow" as const, fairValue: base * 1.00, confidence: 0.7, inputs: {}, asOf: "x" },
      { status: "ok" as const, modelId: "pe" as const, modelName: "b", category: "multiple" as const, fairValue: base * 1.05, confidence: 0.7, inputs: {}, asOf: "x" },
      { status: "ok" as const, modelId: "ddm" as const, modelName: "c", category: "dividend" as const, fairValue: base * 0.98, confidence: 0.7, inputs: {}, asOf: "x" },
    ];
    const c = buildConsensus(fake, base);
    expect(c.certainty).toBe("high");
  });

  it("labels low certainty when models diverge widely", () => {
    const base = 100;
    const fake = [
      { status: "ok" as const, modelId: "dcf" as const, modelName: "a", category: "cash_flow" as const, fairValue: base * 0.5, confidence: 0.7, inputs: {}, asOf: "x" },
      { status: "ok" as const, modelId: "pe" as const, modelName: "b", category: "multiple" as const, fairValue: base * 3.0, confidence: 0.7, inputs: {}, asOf: "x" },
    ];
    const c = buildConsensus(fake, base);
    expect(c.certainty).toBe("low");
  });
});
