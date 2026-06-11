const ACCESS_KEY = "zc_access";
const REFRESH_KEY = "zc_refresh";

const isBrowser = typeof window !== "undefined";

export const tokenStore = {
  getAccess(): string | null {
    return isBrowser ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefresh(): string | null {
    return isBrowser ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  setAccess(token: string): void {
    if (isBrowser) window.localStorage.setItem(ACCESS_KEY, token);
  },
  setTokens(access: string, refresh: string): void {
    if (!isBrowser) return;
    window.localStorage.setItem(ACCESS_KEY, access);
    window.localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear(): void {
    if (!isBrowser) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
