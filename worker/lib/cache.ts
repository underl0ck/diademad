const inFlight = new Map<string, Promise<unknown>>();

export async function withCache<T>(
  cacheKey: string,
  ctx: ExecutionContext,
  ttlSeconds: number,
  producer: () => Promise<T | null>,
): Promise<{ data: T | null; hit: boolean }> {
  const cache = caches.default;
  const req = new Request(`https://cache.diademad.internal/${cacheKey}`);

  const cached = await cache.match(req);
  if (cached) return { data: (await cached.json()) as T, hit: true };

  let pending = inFlight.get(cacheKey) as Promise<T | null> | undefined;
  if (!pending) {
    pending = producer();
    inFlight.set(cacheKey, pending);
    pending.finally(() => inFlight.delete(cacheKey));
  }
  const data = await pending;

  if (data !== null) {
    const response = new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `s-maxage=${ttlSeconds}`,
      },
    });
    ctx.waitUntil(cache.put(req, response));
  }
  return { data, hit: false };
}
