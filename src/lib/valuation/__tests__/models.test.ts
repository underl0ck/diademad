import { describe, it, expect } from "vitest";
import { peModel } from "../models/pe";
import { ddmModel } from "../models/ddm";
import { dcfModel } from "../models/dcf";
import { ITUB_MOCK, PBR_MOCK, NEG_MOCK } from "../../mock/fundamentals";

describe("P/E model", () => {
  it("computes fair value for ITUB from peer median P/E", () => {
    const r = peModel(ITUB_MOCK);
    expect(r.status).toBe("ok");
    if (r.status === "ok") {
      // peer P/Es: 7.2, 8.1, 6.0 → median 7.2; epsForward 0.88
      expect(r.fairValue).toBeCloseTo(0.88 * 7.2, 5);
      expect(r.inputs.peerMedianPE).toBeCloseTo(7.2, 5);
    }
  });
  it("returns n/a with negative_earnings when forward EPS <= 0", () => {
    const r = peModel(NEG_MOCK);
    expect(r.status).toBe("n/a");
    if (r.status === "n/a") expect(r.reason).toBe("negative_earnings");
  });
});

describe("DDM model", () => {
  it("computes fair value for ITUB", () => {
    const r = ddmModel(ITUB_MOCK);
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.fairValue).toBeGreaterThan(0);
  });
  it("returns n/a with no_dividend when DPS is zero", () => {
    const r = ddmModel(NEG_MOCK);
    expect(r.status).toBe("n/a");
    if (r.status === "n/a") expect(r.reason).toBe("no_dividend");
  });
});

describe("DCF model", () => {
  it("computes fair value for ITUB and PBR", () => {
    const itub = dcfModel(ITUB_MOCK);
    const pbr = dcfModel(PBR_MOCK);
    expect(itub.status).toBe("ok");
    expect(pbr.status).toBe("ok");
    if (itub.status === "ok") expect(itub.fairValue).toBeGreaterThan(0);
    if (pbr.status === "ok") expect(pbr.fairValue).toBeGreaterThan(0);
  });
  it("returns n/a with negative_fcf when FCF <= 0", () => {
    const r = dcfModel(NEG_MOCK);
    expect(r.status).toBe("n/a");
    if (r.status === "n/a") expect(r.reason).toBe("negative_fcf");
  });
});
