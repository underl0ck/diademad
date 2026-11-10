import { useQuery } from "@tanstack/react-query";
import type { Quote, Fundamentals, PriceSeries } from "./valuation/types";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return (await res.json()) as T;
}

const QUOTE_STALE = 5 * 60 * 1000;
const SNAPSHOT_STALE = 30 * 60 * 1000;

export function useSymbolData(ticker: string) {
  const quote = useQuery({
    queryKey: ["quote", ticker],
    queryFn: () => get<Quote>(`/api/quote/${ticker}`),
    staleTime: QUOTE_STALE,
  });
  const fundamentals = useQuery({
    queryKey: ["fundamentals", ticker],
    queryFn: () => get<Fundamentals>(`/api/fundamentals/${ticker}`),
    staleTime: SNAPSHOT_STALE,
  });
  const series = useQuery({
    queryKey: ["series", ticker],
    queryFn: () => get<PriceSeries>(`/api/series/${ticker}`),
    staleTime: SNAPSHOT_STALE,
  });

  return {
    quote: quote.data,
    fundamentals: fundamentals.data,
    series: series.data,
    isLoading: quote.isLoading || fundamentals.isLoading || series.isLoading,
    error: quote.error ?? fundamentals.error ?? series.error,
  };
}
