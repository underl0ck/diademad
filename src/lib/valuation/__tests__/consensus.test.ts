import { describe, it, expect } from "vitest";
import { buildConsensus } from "../consensus";
import { peModel } from "../models/pe";
import { ddmModel } from "../models/ddm";
import { dcfModel } from "../models/dcf";
import { ITUB_MOCK, NEG_MOCK } from "../../mock/fundamentals";

const models = (f: typeof ITUB_MOCK) => [peModel(f), ddmModel(f), dcfModel(f)];

describe("buildConsensus", () => {
  it("includes all 3 models for ITUB", () => {
    const c = buildConsensus(models(ITUB_MOCK), ITUB_MOCK.currentPrice);
    expect(c.applicableCount).toBe(3);
    expect(c.totalCount).toBe(3);
    expect(c.includedModels).toEqual(["pe", "ddm", "dcf"]);
    expect(c.fairValue).toBeGreaterThan(0);
  });

  it("returns 0 and lists exclusions when every model is n/a", () => {
    const c = buildConsensus(models(NEG_MOCK), NEG_MOCK.currentPrice);
    expect(c.applicableCount).toBe(0);
    expect(c.fairValue).toBe(0);
    expect(c.excluded).toHaveLength(3);
    expect(c.excluded.map((e) => e.reason).sort()).toEqual(
      ["negative_earnings", "negative_fcf", "no_dividend"]
    );
  });

  it("clamps a wildly out-of-band consensus to 5x current price", () => {
    const fake = [
      { status: "ok" as const, modelId: "dcf" as const, modelName: "x", category: "cash_flow" as const,
        fairValue: ITUB_MOCK.currentPrice * 100, confidence: 1, inputs: {}, asOf: ITUB_MOCK.asOf },
    ];
    const c = buildConsensus(fake, ITUB_MOCK.currentPrice);
    expect(c.median).toBeCloseTo(ITUB_MOCK.currentPrice * 100, 5);
    expect(c.fairValue).toBeCloseTo(ITUB_MOCK.currentPrice * 5, 5);
  });

  it("weighted median suppresses a single outlier", () => {
    const base = ITUB_MOCK.currentPrice;
    const fake = [
      { status: "ok" as const, modelId: "dcf" as const, modelName: "a", category: "cash_flow" as const, fairValue: base * 0.9, confidence: 0.8, inputs: {}, asOf: ITUB_MOCK.asOf },
      { status: "ok" as const, modelId: "pe" as const,  modelName: "b", category: "multiple" as const,  fairValue: base * 1.0, confidence: 0.8, inputs: {}, asOf: ITUB_MOCK.asOf },
      { status: "ok" as const, modelId: "ddm" as const, modelName: "c", category: "dividend" as const,  fairValue: base * 10,  confidence: 0.1, inputs: {}, asOf: ITUB_MOCK.asOf },
    ];
    const c = buildConsensus(fake, base);
    expect(c.median).toBeLessThan(base * 2);
  });
});
