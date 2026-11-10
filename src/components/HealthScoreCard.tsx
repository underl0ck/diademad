import type { HealthScore, SubScore } from "../lib/valuation/types";
import { fmtInput } from "../lib/format";

const LABELS: Record<Exclude<keyof HealthScore, "composite">, string> = {
  momentum: "Price momentum",
  growth: "Growth",
  profitability: "Profitability",
  cashFlow: "Cash flow",
  relativeValue: "Relative value",
};

export function HealthScoreCard({ health }: { health: HealthScore }) {
  const subs = (Object.keys(LABELS) as Array<keyof typeof LABELS>).map(
    (k) => [k, health[k]] as [keyof typeof LABELS, SubScore],
  );

  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900/50">
      <div className="border-b border-gray-800 px-4 py-3">
        <h2 className="text-sm font-medium">Health score</h2>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-baseline gap-2">
          <div className="text-4xl font-semibold">{health.composite.toFixed(0)}</div>
          <div className="text-sm text-gray-500">/ 100</div>
        </div>
        <div className="h-2 overflow-hidden rounded bg-gray-800">
          <div className="h-full bg-bull" style={{ width: `${health.composite}%` }} />
        </div>
        <ul className="space-y-3 text-sm">
          {subs.map(([key, sub]) => (
            <li key={key}>
              <details>
                <summary className="flex cursor-pointer items-baseline justify-between gap-2 hover:text-gray-200">
                  <span>{LABELS[key]}</span>
                  <span className="font-mono">{sub.value.toFixed(0)}</span>
                </summary>
                <div className="mt-2 h-1 overflow-hidden rounded bg-gray-800">
                  <div className="h-full bg-gray-500" style={{ width: `${sub.value}%` }} />
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-500">
                  {Object.entries(sub.inputs).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <dt>{k}</dt>
                      <dd className="font-mono" title={String(v)}>{fmtInput(v)}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
