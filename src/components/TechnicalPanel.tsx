import type { Technicals } from "../lib/technical/indicators";
import { fmtCurrency, fmtPct } from "../lib/format";

export function TechnicalPanel({ t }: { t: Technicals }) {
  const rsiTone =
    t.rsi14 === null ? "text-gray-400"
      : t.rsi14 >= 70 ? "text-bear"
      : t.rsi14 <= 30 ? "text-bull"
      : "text-gray-200";

  const rsiLabel =
    t.rsi14 === null ? "—"
      : t.rsi14 >= 70 ? "overbought"
      : t.rsi14 <= 30 ? "oversold"
      : "neutral";

  const macdTone =
    t.macd && t.macd.histogram !== null
      ? t.macd.histogram > 0 ? "text-bull" : "text-bear"
      : "text-gray-400";

  const above = (ma: number | null) =>
    ma === null ? "—" : t.last > ma ? "above" : "below";

  const bbPos =
    t.bollinger && t.bollinger.upper !== null && t.bollinger.lower !== null
      ? t.last >= t.bollinger.upper ? "near upper"
      : t.last <= t.bollinger.lower ? "near lower"
      : "inside bands"
      : "—";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Block title="RSI (14)">
        <div className={`text-2xl font-semibold ${rsiTone}`}>
          {t.rsi14 === null ? "—" : t.rsi14.toFixed(1)}
        </div>
        <div className="text-xs text-gray-500">{rsiLabel}</div>
      </Block>

      <Block title="MACD (12, 26, 9)">
        <div className={`text-2xl font-semibold ${macdTone}`}>
          {t.macd?.histogram == null ? "—" : t.macd.histogram.toFixed(3)}
        </div>
        <div className="text-xs text-gray-500">
          {t.macd?.macd == null || t.macd.signal == null
            ? "insufficient history"
            : `line ${t.macd.macd.toFixed(2)} · signal ${t.macd.signal.toFixed(2)}`}
        </div>
      </Block>

      <Block title="Moving averages">
        <dl className="space-y-1 text-sm">
          <Row label="SMA 20"  value={t.sma20}  hint={above(t.sma20)} />
          <Row label="SMA 50"  value={t.sma50}  hint={above(t.sma50)} />
          <Row label="SMA 200" value={t.sma200} hint={above(t.sma200)} />
        </dl>
        {t.cross && (
          <div className={`mt-2 text-xs font-medium ${t.cross === "golden" ? "text-bull" : "text-bear"}`}>
            {t.cross === "golden" ? "Golden cross" : "Death cross"} on last bar
          </div>
        )}
      </Block>

      <Block title="Bollinger (20, 2)">
        <div className="text-sm">{bbPos}</div>
        <div className="mt-1 text-xs text-gray-500">
          width {t.bollingerWidth === null ? "—" : fmtPct(t.bollingerWidth, 1)}
        </div>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-gray-800 p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: number | null; hint: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-gray-400">{label}</dt>
      <dd className="font-mono">
        {value === null ? "—" : fmtCurrency(value)}
        <span className="ml-2 text-xs text-gray-500">{hint}</span>
      </dd>
    </div>
  );
}
