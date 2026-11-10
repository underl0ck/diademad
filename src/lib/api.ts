import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Quote, Fundamentals, PriceSeries } from "./valuation/types";
import { useMe } from "./auth";

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

export interface WatchlistEntry { ticker: string; added_at: number; }

export function useWatchlist() {
  const qc = useQueryClient();
  const { data: me } = useMe();

  const list = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => get<WatchlistEntry[]>("/api/watchlist"),
    staleTime: 30 * 1000,
    enabled: !!me,
  });

  const add = useMutation({
    mutationFn: (ticker: string) =>
      fetch(`/api/watchlist/${ticker}`, { method: "POST" }).then((r) => {
        if (!r.ok) throw new Error(`add ${ticker} failed`);
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const remove = useMutation({
    mutationFn: (ticker: string) =>
      fetch(`/api/watchlist/${ticker}`, { method: "DELETE" }).then((r) => {
        if (!r.ok) throw new Error(`remove ${ticker} failed`);
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const tickers = new Set((list.data ?? []).map((e) => e.ticker));
  const has = (t: string) => tickers.has(t.toUpperCase());

  return { entries: list.data ?? [], isLoading: list.isLoading, add, remove, has };
}
