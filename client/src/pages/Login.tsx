import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.user, data.accessToken);
      nav(data.user.role === "ADMIN" ? "/admin" : "/account");
    } catch (e: any) {
      setError(e.response?.data?.error ?? "Login failed");
    }
  };

  return (
    <div className="container py-32 max-w-md">
      <h1 className="text-4xl mb-8 text-center">Welcome back</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
               className="w-full border-b border-charcoal/20 bg-transparent py-3 outline-none" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
               className="w-full border-b border-charcoal/20 bg-transparent py-3 outline-none" required />
        {error && <p className="text-terracotta text-sm">{error}</p>}
        <button className="btn btn-primary w-full">Sign in</button>
      </form>
      <p className="text-center mt-6 text-sm text-muted">
        New here? <Link to="/register" className="link-underline text-charcoal">Create an account</Link>
      </p>
      <p className="text-xs text-center text-muted mt-8">
        Demo: admin@lvy.shop / admin1234 · demo@lvy.shop / demo1234
      </p>
    </div>
  );
}
