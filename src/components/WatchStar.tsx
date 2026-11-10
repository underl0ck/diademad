import { useWatchlist } from "../lib/api";
import { useMe, loginWithGithub } from "../lib/auth";

export function WatchStar({ ticker }: { ticker: string }) {
  const { data: me } = useMe();
  const { has, add, remove } = useWatchlist();
  const watched = has(ticker);
  const pending = add.isPending || remove.isPending;

  if (!me) {
    return (
      <button
        onClick={loginWithGithub}
        className="flex items-center gap-1.5 rounded bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-300 hover:bg-gray-700"
        title="Sign in to save to watchlist"
      >
        <span className="text-sm leading-none">☆</span>
        <span>Sign in to watch</span>
      </button>
    );
  }

  const toggle = () => {
    if (pending) return;
    if (watched) remove.mutate(ticker);
    else add.mutate(ticker);
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
        watched ? "bg-bull/20 text-bull hover:bg-bull/30" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      } ${pending ? "opacity-50" : ""}`}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
    >
      <span className="text-sm leading-none">{watched ? "★" : "☆"}</span>
      <span>{watched ? "Watched" : "Watch"}</span>
    </button>
  );
}
