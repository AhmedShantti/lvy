import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { LvyLogo } from "@/components/brand/LvyLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resent, setResent] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNeedsVerify(false);
    setResent(false);
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      nav(data.user.role === "ADMIN" ? "/admin" : "/account");
    } catch (e: any) {
      if (e.response?.data?.code === "EMAIL_NOT_VERIFIED") setNeedsVerify(true);
      setError(e.response?.data?.error ?? "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await api.post("/auth/resend-verification", { email });
      setResent(true);
    } catch {
      /* generic — ignore */
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" aria-label="LVY — home" className="inline-block">
            <LvyLogo title="LVY" className="mx-auto h-7 w-auto text-charcoal" />
          </Link>
          <h1 className="mt-8 font-display text-4xl tracking-tightest">Welcome back</h1>
          <p className="mt-2 text-sm text-stone">Sign in to your account.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label htmlFor="password" className="field-label mb-0">Password</label>
              <a
                href="mailto:support@lvy.shop?subject=Password%20help"
                className="text-[11px] uppercase tracking-[0.2em] text-stone transition hover:text-terracotta"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm" role="alert">
              <p className="flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0 text-terracotta" />
                {error}
              </p>
              {needsVerify && (
                <button
                  type="button"
                  onClick={resend}
                  disabled={resent}
                  className="mt-2 text-[11px] uppercase tracking-[0.2em] text-terracotta underline disabled:opacity-60"
                >
                  {resent ? "Verification email resent" : "Resend verification email"}
                </button>
              )}
            </div>
          )}

          <button className="btn btn-terracotta w-full text-sm uppercase tracking-[0.15em] disabled:opacity-60" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone">
          New here?{" "}
          <Link to="/register" className="link-underline text-charcoal">Create an account</Link>
        </p>

        <p className="mt-8 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone">
          <Lock size={12} className="text-terracotta/70" /> Secure authentication · Your data is protected
        </p>
      </div>
    </div>
  );
}
