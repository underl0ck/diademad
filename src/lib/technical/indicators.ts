export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}

export function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev: number | null = null;
  let seed = 0;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { seed += values[i]; out.push(null); continue; }
    if (i === period - 1) {
      seed += values[i];
      prev = seed / period;
      out.push(prev);
      continue;
    }
    prev = values[i] * k + (prev as number) * (1 - k);
    out.push(prev);
  }
  return out;
}

export function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = [null];
  if (values.length < 2) return out;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = Math.max(0, diff);
    const loss = Math.max(0, -diff);
    if (i <= period) {
      avgGain += gain / period;
      avgLoss += loss / period;
      if (i < period) { out.push(null); continue; }
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    out.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }
  return out;
}

export interface MacdPoint {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
}

export function macd(values: number[], fast = 12, slow = 26, signalPeriod = 9): MacdPoint[] {
  const f = ema(values, fast);
  const s = ema(values, slow);
  const line = values.map((_, i) => (f[i] !== null && s[i] !== null ? f[i]! - s[i]! : null));
  const defined = line.filter((v): v is number => v !== null);
  const sigDefined = ema(defined, signalPeriod);
  const signal: (number | null)[] = [];
  let j = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === null) signal.push(null);
    else { signal.push(sigDefined[j] ?? null); j++; }
  }
  return line.map((m, i) => ({
    macd: m,
    signal: signal[i],
    histogram: m !== null && signal[i] !== null ? m - signal[i]! : null,
  }));
}

export interface BollingerPoint {
  upper: number | null;
  middle: number | null;
  lower: number | null;
}

export function bollinger(values: number[], period = 20, mult = 2): BollingerPoint[] {
  const mid = sma(values, period);
  const out: BollingerPoint[] = [];
  for (let i = 0; i < values.length; i++) {
    if (mid[i] === null) { out.push({ upper: null, middle: null, lower: null }); continue; }
    let v = 0;
    for (let j = i - period + 1; j <= i; j++) v += (values[j] - mid[i]!) ** 2;
    const sd = Math.sqrt(v / period);
    out.push({ upper: mid[i]! + mult * sd, middle: mid[i]!, lower: mid[i]! - mult * sd });
  }
  return out;
}

export interface Technicals {
  last: number;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  rsi14: number | null;
  macd: MacdPoint | null;
  bollinger: BollingerPoint | null;
  cross: "golden" | "death" | null;
  bollingerWidth: number | null;
}

export function computeTechnicals(closes: number[]): Technicals {
  const s20 = sma(closes, 20);
  const s50 = sma(closes, 50);
  const s200 = sma(closes, 200);
  const rs = rsi(closes, 14);
  const ms = macd(closes, 12, 26, 9);
  const bs = bollinger(closes, 20, 2);

  const idx = closes.length - 1;
  const last = closes[idx] ?? 0;

  let cross: "golden" | "death" | null = null;
  const a0 = s50[idx - 1], a1 = s50[idx];
  const b0 = s200[idx - 1], b1 = s200[idx];
  if (a0 != null && a1 != null && b0 != null && b1 != null) {
    if (a0 <= b0 && a1 > b1) cross = "golden";
    else if (a0 >= b0 && a1 < b1) cross = "death";
  }

  const bb = bs[idx];
  const bollingerWidth =
    bb && bb.upper != null && bb.lower != null && bb.middle
      ? (bb.upper - bb.lower) / bb.middle
      : null;

  return {
    last,
    sma20: s20[idx],
    sma50: s50[idx],
    sma200: s200[idx],
    rsi14: rs[idx],
    macd: ms[idx] ?? null,
    bollinger: bb,
    cross,
    bollingerWidth,
  };
}
