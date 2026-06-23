import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Lock, MailCheck } from "lucide-react";
import { api } from "@/lib/api";
import { LvyLogo } from "@/components/brand/LvyLogo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (e: any) {
      setError(e.response?.data?.error ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="container flex min-h-[80vh] items-center justify-center py-16">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sage/15">
            <MailCheck size={26} className="text-sage" />
          </div>
          <h1 className="font-display text-3xl tracking-tightest">Check your email</h1>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            If an account exists for <span className="text-charcoal">{email}</span>, we've sent a link to
            reset your password. The link expires in 1 hour.
          </p>
          <Link to="/login" className="btn btn-terracotta mt-8 w-full text-sm uppercase tracking-[0.15em]">
            Back to sign in
          </Link>
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
          <h1 className="mt-8 font-display text-4xl tracking-tightest">Forgot password</h1>
          <p className="mt-2 text-sm text-stone">Enter your email and we'll send you a reset link.</p>
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

          {error && (
            <p className="flex items-center gap-2 rounded-md border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm" role="alert">
              <AlertCircle size={16} className="flex-shrink-0 text-terracotta" />
              {error}
            </p>
          )}

          <button className="btn btn-terracotta w-full text-sm uppercase tracking-[0.15em] disabled:opacity-60" disabled={busy}>
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone">
          Remembered it?{" "}
          <Link to="/login" className="link-underline text-charcoal">Sign in</Link>
        </p>

        <p className="mt-8 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone">
          <Lock size={12} className="text-terracotta/70" /> Secure authentication · Your data is protected
        </p>
      </div>
    </div>
  );
}
