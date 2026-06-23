import axios from "axios";
import { useAuth } from "@/store/auth";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("lvy.token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Silent token refresh ──
// When a request 401s (expired access token), try once to mint a new pair from
// the stored refresh token, then retry the original request. Keeps the admin
// signed in for the full refresh-token lifetime instead of forcing re-login.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("lvy.refresh");
  if (!refreshToken) return null;
  try {
    // Use a bare axios call so this request skips the interceptors below.
    const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
    useAuth.getState().setTokens(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    useAuth.getState().logout();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = typeof original?.url === "string" && original.url.includes("/auth/");

    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      // De-dupe concurrent refreshes into a single request.
      refreshing = refreshing ?? refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);
