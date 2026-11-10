import { describe, it, expect } from "vitest";
import { sma, ema, rsi, macd, bollinger, computeTechnicals } from "../indicators";

describe("SMA", () => {
  it("computes rolling average with nulls for warmup", () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });
  it("returns all null when input is shorter than period", () => {
    expect(sma([1, 2], 5)).toEqual([null, null]);
  });
});

describe("EMA", () => {
  it("seeds from SMA then applies smoothing", () => {
    const out = ema([1, 2, 3, 4, 5], 3);
    expect(out[0]).toBeNull();
    expect(out[1]).toBeNull();
    expect(out[2]).toBeCloseTo(2, 5);
    expect(out[3]).toBeCloseTo(3, 5);
    expect(out[4]).toBeCloseTo(4, 5);
  });
});

describe("RSI", () => {
  it("returns 100 for a monotonically increasing series", () => {
    const v = Array.from({ length: 30 }, (_, i) => i + 1);
    const out = rsi(v, 14);
    expect(out[out.length - 1]).toBeCloseTo(100, 5);
  });
  it("returns 0 for a monotonically decreasing series", () => {
    const v = Array.from({ length: 30 }, (_, i) => 100 - i);
    const out = rsi(v, 14);
    expect(out[out.length - 1]).toBeCloseTo(0, 5);
  });
  it("emits null for the first period", () => {
    const v = Array.from({ length: 20 }, (_, i) => i + 1);
    const out = rsi(v, 14);
    expect(out[0]).toBeNull();
    expect(out[13]).toBeNull();
    expect(out[14]).not.toBeNull();
  });
});

describe("MACD", () => {
  it("stays near zero on a flat series", () => {
    const v = new Array(60).fill(100);
    const out = macd(v, 12, 26, 9);
    const last = out[out.length - 1];
    expect(Math.abs(last.macd ?? 0)).toBeLessThan(0.001);
    expect(Math.abs(last.histogram ?? 0)).toBeLessThan(0.001);
  });
  it("MACD is positive on an uptrend (fast above slow)", () => {
    const v = Array.from({ length: 60 }, (_, i) => 100 + i * 0.5);
    const last = macd(v, 12, 26, 9).at(-1)!;
    expect(last.macd).toBeGreaterThan(0);
  });
});

describe("Bollinger", () => {
  it("upper == middle == lower on a constant series", () => {
    const v = new Array(30).fill(50);
    const last = bollinger(v, 20, 2).at(-1)!;
    expect(last.upper).toBeCloseTo(50, 5);
    expect(last.middle).toBeCloseTo(50, 5);
    expect(last.lower).toBeCloseTo(50, 5);
  });
  it("bands widen as volatility increases", () => {
    const calm = Array.from({ length: 30 }, (_, i) => 50 + Math.sin(i / 10) * 0.5);
    const wild = Array.from({ length: 30 }, (_, i) => 50 + Math.sin(i / 10) * 5);
    const calmBW = bollinger(calm).at(-1)!.upper! - bollinger(calm).at(-1)!.lower!;
    const wildBW = bollinger(wild).at(-1)!.upper! - bollinger(wild).at(-1)!.lower!;
    expect(wildBW).toBeGreaterThan(calmBW);
  });
});

describe("computeTechnicals", () => {
  it("returns all fields for a 260-point series", () => {
    const closes = Array.from({ length: 260 }, (_, i) => 50 + i * 0.1 + Math.sin(i / 8) * 2);
    const t = computeTechnicals(closes);
    expect(t.sma20).not.toBeNull();
    expect(t.sma50).not.toBeNull();
    expect(t.sma200).not.toBeNull();
    expect(t.rsi14).not.toBeNull();
    expect(t.macd).not.toBeNull();
    expect(t.bollinger).not.toBeNull();
    expect(t.bollingerWidth).not.toBeNull();
  });
});
