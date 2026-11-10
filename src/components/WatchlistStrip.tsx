import { Link } from "react-router-dom";
import { useWatchlist } from "../lib/api";

export function WatchlistStrip() {
  const { entries, isLoading, remove } = useWatchlist();

  if (isLoading) return null;

  if (entries.length === 0) {
    return (
      <div className="text-center text-xs text-gray-600">
        Your watchlist is empty. Open a symbol and click ☆ Watch.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-2 text-center text-xs uppercase tracking-wide text-gray-500">
        Watchlist
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {entries.map((e) => (
          <span
            key={e.ticker}
            className="group flex items-center gap-1 rounded border border-gray-700 bg-gray-800/50 pl-2 pr-1 py-1 text-sm hover:border-gray-500"
          >
            <Link to={`/symbol/${e.ticker}`} className="hover:text-white">
              {e.ticker}
            </Link>
            <button
              onClick={() => remove.mutate(e.ticker)}
              className="ml-1 rounded px-1 text-xs text-gray-500 opacity-0 transition group-hover:opacity-100 hover:text-bear"
              title="Remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
