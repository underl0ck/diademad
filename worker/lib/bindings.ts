export type Bindings = {
  FMP_API_KEY?: string;
  DB: D1Database;
  API_LIMITER: RateLimit;
  HEAVY_LIMITER: RateLimit;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

export type AuthUser = {
  id: string;
  github_login: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
};

export type AuthVariables = {
  user: AuthUser | null;
};
