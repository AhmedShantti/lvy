import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User { id: string; email: string; name: string; role: "CUSTOMER" | "ADMIN"; }

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (u: User, token: string, refreshToken?: string) => void;
  /** Update just the tokens (used by the silent-refresh interceptor). */
  setTokens: (token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) => {
        localStorage.setItem("lvy.token", token);
        if (refreshToken) localStorage.setItem("lvy.refresh", refreshToken);
        set({ user, token, refreshToken: refreshToken ?? get().refreshToken });
      },
      setTokens: (token, refreshToken) => {
        localStorage.setItem("lvy.token", token);
        if (refreshToken) localStorage.setItem("lvy.refresh", refreshToken);
        set({ token, refreshToken: refreshToken ?? get().refreshToken });
      },
      logout: () => {
        localStorage.removeItem("lvy.token");
        localStorage.removeItem("lvy.refresh");
        set({ user: null, token: null, refreshToken: null });
      },
    }),
    { name: "lvy.auth" }
  )
);
