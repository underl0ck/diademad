import type { ConsensusFairValue } from "../lib/valuation/types";
import { fmtCurrency, fmtPct } from "../lib/format";

export function ConsensusCard({
  consensus, currentPrice,
}: { consensus: ConsensusFairValue; currentPrice: number }) {
  const undervalued = consensus.varianceVsPrice > 0;
  const tone = undervalued ? "text-bull" : "text-bear";
  const label = undervalued ? "Undervalued" : "Overvalued";
  const clamped = Math.abs(consensus.fairValue - consensus.median) > 0.01;

  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900/50">
      <div className="border-b border-gray-800 px-4 py-3">
        <h2 className="text-sm font-medium">Consensus fair value</h2>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <div className="text-3xl font-semibold">{fmtCurrency(consensus.fairValue)}</div>
          <div className={`text-sm ${tone}`}>
            {label} · {fmtPct(consensus.varianceVsPrice, 2)} vs. {fmtCurrency(currentPrice)}
          </div>
          {clamped && (
            <div className="mt-1 text-xs text-gray-500">
              Raw median {fmtCurrency(consensus.median)} — clamped to [0.2×, 5×] of price
            </div>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3 text-xs">
          <Field label="Median" value={fmtCurrency(consensus.median)} />
          <Field label="Mean" value={fmtCurrency(consensus.mean)} />
          <Field label="Std dev" value={fmtCurrency(consensus.stdDev)} />
          <Field label="Spread" value={`${consensus.spread.toFixed(2)}×`} />
        </dl>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Certainty</span>
          <span
            className={
              consensus.certainty === "high" ? "text-bull"
              : consensus.certainty === "low" ? "text-bear"
              : "text-gray-300"
            }
          >
            {consensus.certainty.toUpperCase()}
          </span>
          <span className="text-gray-600">
            ({consensus.certainty === "high" ? "models tightly clustered"
              : consensus.certainty === "low" ? "models diverge widely"
              : "moderate dispersion"})
          </span>
        </div>

        <div>
          <div className="text-xs text-gray-400">
            Applicable models: {consensus.applicableCount} / {consensus.totalCount}
          </div>
          {consensus.excluded.length > 0 && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-gray-400 hover:text-gray-200">
                {consensus.excluded.length} excluded — show reasons
              </summary>
              <ul className="mt-2 space-y-1 text-gray-500">
                {consensus.excluded.map((e) => (
                  <li key={e.id} className="flex justify-between gap-3">
                    <span className="font-mono">{e.id}</span>
                    <span>{e.reason.replace(/_/g, " ")}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-mono text-gray-200">{value}</dd>
    </div>
  );
}
