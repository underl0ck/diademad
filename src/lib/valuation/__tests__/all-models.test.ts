import { describe, it, expect } from "vitest";
import {
  runAllModels, analystConsensusModel, dividendGrowthModel, adjustedNetAssetsModel,
  fcffModel, fcfeModel, capEarningsModel, epvModel, residualIncomeModel, evaModel,
  psModel, pbModel, evEbitdaModel, compsModel, sumOfPartsModel,
} from "../models";
import { ddmModel } from "../models/ddm";
import { MODELS } from "../registry";
import { ITUB_MOCK, NEG_MOCK } from "../../mock/fundamentals";

describe("runAllModels", () => {
  it("returns exactly one result per registered model", () => {
    const results = runAllModels(ITUB_MOCK);
    expect(results).toHaveLength(Object.keys(MODELS).length);
    expect(results.map((r) => r.modelId).sort()).toEqual(Object.keys(MODELS).sort());
  });

  it("most models yield ok for a healthy dividend payer", () => {
    const ok = runAllModels(ITUB_MOCK).filter((r) => r.status === "ok");
    expect(ok.length).toBeGreaterThanOrEqual(12);
  });

  it("many models yield n/a for a negative-earnings name", () => {
    const na = runAllModels(NEG_MOCK).filter((r) => r.status === "n/a");
    expect(na.length).toBeGreaterThanOrEqual(8);
  });

  it("every result carries valid metadata", () => {
    for (const r of runAllModels(ITUB_MOCK)) {
      expect(r.modelId in MODELS).toBe(true);
      expect(r.modelName).toBe(MODELS[r.modelId].name);
      expect(r.category).toBe(MODELS[r.modelId].category);
    }
  });

  it("every n/a result carries a reason and non-empty detail", () => {
    for (const r of runAllModels(NEG_MOCK)) {
      if (r.status === "n/a") {
        expect(r.reason).toBeTruthy();
        expect(r.detail.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("individual new models", () => {
  it("analyst_consensus returns the analyst target", () => {
    const r = analystConsensusModel(ITUB_MOCK);
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.fairValue).toBeCloseTo(ITUB_MOCK.analystTargetPrice!, 5);
  });

  it("analyst_consensus is n/a when target missing", () => {
    const r = analystConsensusModel({ ...ITUB_MOCK, analystTargetPrice: null });
    expect(r.status).toBe("n/a");
  });

  it("dividend_growth is more conservative than DDM", () => {
    const dg = dividendGrowthModel(ITUB_MOCK);
    const ddm = ddmModel(ITUB_MOCK);
    expect(dg.status).toBe("ok");
    expect(ddm.status).toBe("ok");
    if (dg.status === "ok" && ddm.status === "ok") {
      expect(dg.fairValue).toBeLessThan(ddm.fairValue);
    }
  });

  it("cash-flow and earnings models compute for ITUB", () => {
    for (const m of [fcffModel, fcfeModel, capEarningsModel, epvModel, residualIncomeModel]) {
      const r = m(ITUB_MOCK);
      expect(r.status).toBe("ok");
      if (r.status === "ok") expect(r.fairValue).toBeGreaterThan(0);
    }
  });

  it("cash-flow and earnings models are n/a for NEG", () => {
    for (const m of [fcffModel, fcfeModel, capEarningsModel, epvModel, residualIncomeModel, evaModel]) {
      const r = m(NEG_MOCK);
      expect(r.status).toBe("n/a");
    }
  });

  it("multiple models compute for ITUB (with Financials gating on EV/EBITDA)", () => {
    expect(psModel(ITUB_MOCK).status).toBe("ok");
    expect(pbModel(ITUB_MOCK).status).toBe("ok");
    expect(compsModel(ITUB_MOCK).status).toBe("ok");
    expect(evEbitdaModel(ITUB_MOCK).status).toBe("n/a");       // financials gate
    expect(sumOfPartsModel(ITUB_MOCK).status).toBe("n/a");     // financials gate
  });

  it("multiple models compute for NEG", () => {
    for (const m of [psModel, pbModel, evEbitdaModel, compsModel, sumOfPartsModel]) {
      const r = m(NEG_MOCK);
      expect(r.status).toBe("ok");
      if (r.status === "ok") expect(r.fairValue).toBeGreaterThan(0);
    }
  });

  it("adjusted_net_assets uses 10% haircut on book value", () => {
    const r = adjustedNetAssetsModel(ITUB_MOCK);
    expect(r.status).toBe("ok");
    if (r.status === "ok") {
      const bvps = ITUB_MOCK.totalEquity / ITUB_MOCK.sharesOutstanding;
      expect(r.fairValue).toBeCloseTo(bvps * 0.9, 5);
    }
  });
});
