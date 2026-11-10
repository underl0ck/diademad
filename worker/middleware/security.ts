import type { MiddlewareHandler } from "hono";
import type { Bindings } from "../lib/bindings";

export const rateLimit =
  (binding: "API_LIMITER" | "HEAVY_LIMITER"): MiddlewareHandler<{ Bindings: Bindings }> =>
  async (c, next) => {
    const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
    const route = new URL(c.req.url).pathname;
    const key = `${ip}:${route}`;

    const limiter = c.env[binding];
    const { success } = await limiter.limit({ key });

    if (!success) {
      c.header("Retry-After", "60");
      return c.json({ error: "rate_limited", retryAfter: 60 }, 429);
    }
    await next();
  };

export const maxBodySize =
  (bytes: number): MiddlewareHandler =>
  async (c, next) => {
    const len = Number(c.req.header("content-length") ?? "0");
    if (len > bytes) {
      return c.json({ error: "payload_too_large", limit: bytes }, 413);
    }
    await next();
  };
