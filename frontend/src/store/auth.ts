import { create } from "zustand";

import { authApi } from "@/lib/api/endpoints";
import { tokenStore } from "@/lib/auth/token-store";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    full_name: string;
    password: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  login: async (email, password) => {
    set({ status: "loading" });
    const tokens = await authApi.login({ email, password });
    tokenStore.setTokens(tokens.access, tokens.refresh);
    const user = await authApi.me();
    set({ user, status: "authenticated" });
  },
  register: async (payload) => {
    await authApi.register(payload);
    const tokens = await authApi.login({
      email: payload.email,
      password: payload.password,
    });
    tokenStore.setTokens(tokens.access, tokens.refresh);
    const user = await authApi.me();
    set({ user, status: "authenticated" });
  },
  logout: async () => {
    const refresh = tokenStore.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } finally {
      tokenStore.clear();
      set({ user: null, status: "unauthenticated" });
    }
  },
  hydrate: async () => {
    if (!tokenStore.getAccess()) {
      set({ status: "unauthenticated" });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, status: "authenticated" });
    } catch {
      tokenStore.clear();
      set({ user: null, status: "unauthenticated" });
    }
  },
}));
