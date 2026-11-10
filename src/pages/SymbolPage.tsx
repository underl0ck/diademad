import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useSymbolData } from "../lib/api";
import { analyze } from "../lib/valuation/analyze";
import { PriceChart } from "../components/PriceChart";
import { HealthScoreCard } from "../components/HealthScoreCard";
import { ConsensusCard } from "../components/ConsensusCard";
import { ModelTable } from "../components/ModelTable";
import { fmtCurrency, fmtPct } from "../lib/format";

export default function SymbolPage() {
  const { ticker = "" } = useParams();
  const upper = ticker.toUpperCase();
  const { quote, fundamentals, series, isLoading, error } = useSymbolData(upper);

  const analysis = useMemo(
    () => (fundamentals && series ? analyze(fundamentals, series) : null),
    [fundamentals, series],
  );

  if (error) {
    return (
      <Centered>
        <p className="text-bear">Failed to load {upper}.</p>
        <p className="mt-1 text-xs text-gray-500">{String(error)}</p>
      </Centered>
    );
  }
  if (isLoading || !quote || !fundamentals || !series || !analysis) {
    return <Centered><span className="text-gray-400">Loading…</span></Centered>;
  }

  const changeTone = quote.change >= 0 ? "text-bull" : "text-bear";

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight hover:text-gray-300">
            diademad
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded bg-gray-800 px-2 py-1 uppercase tracking-wide text-gray-400">
              {quote.source}
            </span>
            <span className="text-gray-500">{new Date(quote.asOf).toLocaleString()}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-gray-400">{fundamentals.name}</div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl font-semibold tracking-tight">{fundamentals.ticker}</h1>
              <span className="text-sm text-gray-500">{fundamentals.sector}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold">{fmtCurrency(quote.price)}</div>
            <div className={`text-sm ${changeTone}`}>
              {quote.change >= 0 ? "+" : ""}{fmtCurrency(quote.change)} ({fmtPct(quote.changePercent, 2)})
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title="Price vs. consensus fair value" subtitle="5 years, weekly">
              <PriceChart series={series} fairValue={analysis.consensus.fairValue} />
            </Card>
            <Card
              title="Valuation models"
              subtitle={`${analysis.consensus.applicableCount} of ${analysis.consensus.totalCount} applicable`}
            >
              <ModelTable results={analysis.results} currentPrice={fundamentals.currentPrice} />
            </Card>
          </div>
          <div className="space-y-6">
            <ConsensusCard
              consensus={analysis.consensus}
              currentPrice={fundamentals.currentPrice}
            />
            <HealthScoreCard health={analysis.health} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900/50">
      <div className="flex items-baseline justify-between border-b border-gray-800 px-4 py-3">
        <h2 className="text-sm font-medium">{title}</h2>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center">{children}</div>;
}
