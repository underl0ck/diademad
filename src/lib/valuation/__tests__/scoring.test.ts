import { describe, it, expect } from "vitest";
import { healthScore } from "../scoring";
import { ITUB_MOCK, ITUB_SERIES, PBR_MOCK, PBR_SERIES, NEG_MOCK, NEG_SERIES } from "../../mock/fundamentals";

describe("healthScore", () => {
  it("returns all sub-scores in [0, 100] for every fixture", () => {
    for (const [f, s] of [[ITUB_MOCK, ITUB_SERIES], [PBR_MOCK, PBR_SERIES], [NEG_MOCK, NEG_SERIES]] as const) {
      const h = healthScore(f, s);
      expect(h.composite).toBeGreaterThanOrEqual(0);
      expect(h.composite).toBeLessThanOrEqual(100);
      for (const sub of [h.momentum, h.growth, h.profitability, h.cashFlow, h.relativeValue]) {
        expect(sub.value).toBeGreaterThanOrEqual(0);
        expect(sub.value).toBeLessThanOrEqual(100);
        expect(sub.weight).toBeCloseTo(0.20, 5);
      }
    }
  });

  it("ranks the profitable dividend payer above the negative-earnings name", () => {
    const itub = healthScore(ITUB_MOCK, ITUB_SERIES);
    const neg = healthScore(NEG_MOCK, NEG_SERIES);
    expect(itub.composite).toBeGreaterThan(neg.composite);
  });

  it("scores negative-earnings profitability low", () => {
    const h = healthScore(NEG_MOCK, NEG_SERIES);
    expect(h.profitability.value).toBeLessThan(20);
  });

  it("scores the positive-trend price series with strong momentum", () => {
    const h = healthScore(ITUB_MOCK, ITUB_SERIES);
    expect(h.momentum.value).toBeGreaterThan(40);
  });
});
