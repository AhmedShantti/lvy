import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Lock, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { LvyLogo } from "@/components/brand/LvyLogo";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => nav("/login"), 1800);
    } catch (e: any) {
      setError(e.response?.data?.error ?? "Could not reset your password.");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center py-16">
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-3xl tracking-tightest">Invalid link</h1>
          <p className="mt-3 text-sm text-stone">This reset link is missing its token. Request a new one.</p>
          <Link to="/forgot-password" className="btn btn-terracotta mt-8 w-full text-sm uppercase tracking-[0.15em]">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center py-16">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sage/15">
            <CheckCircle2 size={28} className="text-sage" />
          </div>
          <h1 className="font-display text-3xl tracking-tightest">Password updated</h1>
          <p className="mt-2 text-sm text-stone">Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" aria-label="LVY — home" className="inline-block">
            <LvyLogo title="LVY" className="mx-auto h-7 w-auto text-charcoal" />
          </Link>
          <h1 className="mt-8 font-display text-4xl tracking-tightest">Set a new password</h1>
          <p className="mt-2 text-sm text-stone">Choose a strong password you haven't used before.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="password" className="field-label">New password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm" className="field-label">Confirm new password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input"
              required
            />
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-md border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm" role="alert">
              <AlertCircle size={16} className="flex-shrink-0 text-terracotta" />
              {error}
            </p>
          )}

          <button className="btn btn-terracotta w-full text-sm uppercase tracking-[0.15em] disabled:opacity-60" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>

        <p className="mt-8 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone">
          <Lock size={12} className="text-terracotta/70" /> Secure authentication · Your data is protected
        </p>
      </div>
    </div>
  );
}
