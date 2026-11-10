import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { WatchlistStrip } from "../components/WatchlistStrip";
import { useMe, useLogout, loginWithGithub } from "../lib/auth";

const QUICK = ["ITUB", "PBR", "GROW"];

export default function Landing() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [input, setInput] = useState("");
  const { data: me, isLoading } = useMe();
  const logout = useLogout();

  const authError = params.get("auth") === "failed" ? params.get("reason") : null;

  const go = (t: string) => {
    const clean = t.trim().toUpperCase();
    if (clean) nav(`/symbol/${clean}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
          {isLoading ? null : me ? (
            <>
              <span>Signed in as <span className="text-gray-200">@{me.github_login}</span></span>
              <button
                onClick={() => logout.mutate()}
                className="rounded border border-gray-700 px-2 py-1 hover:border-gray-500"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={loginWithGithub}
              className="rounded border border-gray-700 px-3 py-1.5 hover:border-gray-500 hover:text-gray-200"
            >
              Sign in with GitHub
            </button>
          )}
        </div>

        {authError && (
          <div className="rounded border border-bear/50 bg-bear/10 px-3 py-2 text-xs text-bear">
            Sign-in failed: {authError}
          </div>
        )}

        <div className="space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight">diademad</h1>
          <p className="text-sm text-gray-400">
            A transparent 0–100 health score and consensus fair value from 17 named models.
            Every input, every formula, visible.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); go(input); }} className="flex gap-2">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Ticker (e.g. ITUB)"
              className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm uppercase outline-none focus:border-gray-500"
            />
            <button type="submit" className="rounded bg-bull px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Analyze
            </button>
          </form>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>Quick picks:</span>
            {QUICK.map((t) => (
              <button key={t} onClick={() => go(t)} className="rounded border border-gray-700 px-2 py-1 hover:border-gray-500">
                {t}
              </button>
            ))}
          </div>
        </div>

        {me && <WatchlistStrip />}

        <p className="text-xs text-gray-600">
          Data source: mock (deterministic per ticker). FMP wired and ready for a key.
        </p>
      </div>
    </div>
  );
}
