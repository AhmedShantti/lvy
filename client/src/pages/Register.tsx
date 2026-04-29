import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      setAuth(data.user, data.accessToken);
      nav("/account");
    } catch (e: any) {
      setError(e.response?.data?.error ?? "Registration failed");
    }
  };

  return (
    <div className="container py-32 max-w-md">
      <h1 className="text-4xl mb-8 text-center">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {(["name", "email", "password"] as const).map((k) => (
          <input
            key={k}
            type={k === "password" ? "password" : k === "email" ? "email" : "text"}
            placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            className="w-full border-b border-charcoal/20 bg-transparent py-3 outline-none"
            required
          />
        ))}
        {error && <p className="text-terracotta text-sm">{error}</p>}
        <button className="btn btn-primary w-full">Create account</button>
      </form>
      <p className="text-center mt-6 text-sm text-muted">
        Already a member? <Link to="/login" className="link-underline text-charcoal">Sign in</Link>
      </p>
    </div>
  );
}
