import { Hono } from "hono";

type Bindings = {
  FMP_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/health", (c) =>
  c.json({ ok: true, app: "diademad", ts: new Date().toISOString() })
);

export default app;
