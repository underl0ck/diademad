import type { ModelResult } from "../lib/valuation/types";
import { fmtCurrency, fmtPct, fmtInput } from "../lib/format";

export function ModelTable({
  results, currentPrice,
}: { results: ModelResult[]; currentPrice: number }) {
  const sorted = [...results].sort((a, b) => {
    const cat = a.category.localeCompare(b.category);
    return cat !== 0 ? cat : a.modelName.localeCompare(b.modelName);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-gray-500">
          <tr className="border-b border-gray-800">
            <th className="px-2 py-2 text-left">Model</th>
            <th className="px-2 py-2 text-right">Fair value</th>
            <th className="px-2 py-2 text-right">vs. price</th>
            <th className="px-2 py-2 text-right">Conf.</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <Row key={r.modelId} result={r} currentPrice={currentPrice} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ result, currentPrice }: { result: ModelResult; currentPrice: number }) {
  const catLabel = result.category.replace(/_/g, " ");

  if (result.status === "n/a") {
    return (
      <tr className="border-b border-gray-800/50 text-gray-500">
        <td className="px-2 py-2">
          <div>{result.modelName}</div>
          <div className="text-xs text-gray-600">{catLabel}</div>
        </td>
        <td colSpan={3} className="px-2 py-2 text-right text-xs italic">
          n/a — {result.reason.replace(/_/g, " ")}
          <span className="ml-2 text-gray-600">({result.detail})</span>
        </td>
      </tr>
    );
  }

  const variance = (result.fairValue - currentPrice) / currentPrice;
  const tone = variance > 0 ? "text-bull" : "text-bear";

  return (
    <tr className="border-b border-gray-800/50 hover:bg-gray-800/30">
      <td className="px-2 py-2">
        <details>
          <summary className="cursor-pointer">
            <div>{result.modelName}</div>
            <div className="text-xs text-gray-500">{catLabel}</div>
          </summary>
          <dl className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-500">
            {Object.entries(result.inputs).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt>{k}</dt>
                <dd className="font-mono" title={String(v)}>{fmtInput(v)}</dd>
              </div>
            ))}
          </dl>
        </details>
      </td>
      <td className="px-2 py-2 text-right font-mono">{fmtCurrency(result.fairValue)}</td>
      <td className={`px-2 py-2 text-right font-mono ${tone}`}>{fmtPct(variance, 1)}</td>
      <td className="px-2 py-2 text-right font-mono text-gray-400">
        {(result.confidence * 100).toFixed(0)}%
      </td>
    </tr>
  );
}
