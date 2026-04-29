import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User { id: string; email: string; name: string; role: "CUSTOMER" | "ADMIN"; }

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (u: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("lvy.token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("lvy.token");
        set({ user: null, token: null });
      },
    }),
    { name: "lvy.auth" }
  )
);
