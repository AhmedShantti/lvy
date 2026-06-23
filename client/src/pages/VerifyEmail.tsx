import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { LvyLogo } from "@/components/brand/LvyLogo";

type Status = "verifying" | "success" | "error";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const setAuth = useAuth((s) => s.setAuth);
  const nav = useNavigate();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const ran = useRef(false); // guard against StrictMode double-invoke

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    (async () => {
      try {
        const { data } = await api.post("/auth/verify-email", { token });
        setAuth(data.user, data.accessToken);
        setStatus("success");
        // Brief confirmation, then send them on their way (signed in).
        setTimeout(() => nav(data.user.role === "ADMIN" ? "/admin" : "/account"), 1500);
      } catch (e: any) {
        setStatus("error");
        setMessage(e.response?.data?.error ?? "We couldn't verify your email.");
      }
    })();
  }, [token, setAuth, nav]);

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-16">
      <div className="w-full max-w-md text-center">
        <Link to="/" aria-label="LVY — home" className="inline-block">
          <LvyLogo title="LVY" className="mx-auto h-7 w-auto text-charcoal" />
        </Link>

        {status === "verifying" && (
          <div className="mt-10">
            <Loader2 size={32} className="mx-auto animate-spin text-stone" />
            <h1 className="mt-6 font-display text-3xl tracking-tightest">Verifying your email…</h1>
            <p className="mt-2 text-sm text-stone">One moment while we confirm your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="mt-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sage/15">
              <CheckCircle2 size={28} className="text-sage" />
            </div>
            <h1 className="font-display text-3xl tracking-tightest">Email verified</h1>
            <p className="mt-2 text-sm text-stone">Your account is active. Taking you in…</p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/15">
              <XCircle size={28} className="text-terracotta" />
            </div>
            <h1 className="font-display text-3xl tracking-tightest">Verification failed</h1>
            <p className="mt-2 text-sm text-stone">{message}</p>
            <div className="mt-8 space-y-3">
              <Link to="/login" className="btn btn-terracotta w-full text-sm uppercase tracking-[0.15em]">
                Go to sign in
              </Link>
              <p className="text-xs text-stone">
                You can request a new link from the sign-in page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
