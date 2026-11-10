import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  github_login: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}

async function getMe(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) throw new Error(`/api/auth/me returned ${res.status}`);
  const data = (await res.json()) as { user: AuthUser | null };
  return data.user;
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fetch("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      qc.clear();
      window.location.href = "/";
    },
  });
}

export function loginWithGithub() {
  window.location.href = "/api/auth/login";
}
