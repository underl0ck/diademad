export const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    maximumFractionDigits: 2, minimumFractionDigits: 2,
  }).format(v);

export const fmtPct = (v: number, digits = 2) => `${(v * 100).toFixed(digits)}%`;

export function fmtInput(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 1)   return v.toFixed(2);
  return v.toFixed(4);
}
