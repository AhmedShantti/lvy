import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { LvyLogo } from "@/components/brand/LvyLogo";

const FIELDS = [
  { k: "name" as const, label: "Full name", type: "text", autoComplete: "name" },
  { k: "email" as const, label: "Email", type: "email", autoComplete: "email" },
  { k: "password" as const, label: "Password", type: "password", autoComplete: "new-password" },
];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/register", form);
      setAuth(data.user, data.accessToken);
      nav("/account");
    } catch (e: any) {
      setError(e.response?.data?.error ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" aria-label="LVY — home" className="inline-block">
            <LvyLogo title="LVY" className="mx-auto h-7 w-auto text-charcoal" />
          </Link>
          <h1 className="mt-8 font-display text-4xl tracking-tightest">Create account</h1>
          <p className="mt-2 text-sm text-stone">Join LVY to track orders and save favourites.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {FIELDS.map((f) => (
            <div key={f.k}>
              <label htmlFor={f.k} className="field-label">{f.label}</label>
              <input
                id={f.k}
                type={f.type}
                autoComplete={f.autoComplete}
                value={form[f.k]}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                className="input"
                required
              />
              {f.k === "password" && (
                <p className="mt-1.5 text-xs text-stone">Choose a strong password.</p>
              )}
            </div>
          ))}

          {error && (
            <p className="flex items-center gap-2 rounded-md border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm" role="alert">
              <AlertCircle size={16} className="flex-shrink-0 text-terracotta" />
              {error}
            </p>
          )}

          <button className="btn btn-terracotta w-full text-sm uppercase tracking-[0.15em] disabled:opacity-60" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone">
          Already a member?{" "}
          <Link to="/login" className="link-underline text-charcoal">Sign in</Link>
        </p>

        <p className="mt-8 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone">
          <Lock size={12} className="text-terracotta/70" /> Secure authentication · Your data is protected
        </p>
      </div>
    </div>
  );
}
