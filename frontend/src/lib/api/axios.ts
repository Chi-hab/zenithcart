import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { tokenStore } from "@/lib/auth/token-store";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every outgoing request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    // Bare client to avoid interceptor recursion.
    const { data } = await axios.post<{ access: string }>(
      `${API_URL}/auth/refresh/`,
      { refresh },
    );
    tokenStore.setAccess(data.access);
    return data.access;
  } catch {
    tokenStore.clear();
    return null;
  }
}

// Silently refresh on 401 and replay the original request once.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshPromise = refreshPromise ?? refreshAccessToken();
    const newAccess = await refreshPromise;
    refreshPromise = null;
    if (!newAccess) {
      return Promise.reject(error);
    }
    original.headers = original.headers ?? {};
    (original.headers as Record<string, string>).Authorization =
      `Bearer ${newAccess}`;
    return api(original);
  },
);
