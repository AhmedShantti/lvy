import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

/**
 * Route guard.
 * - Not signed in        → redirect to /login (preserving where they were headed)
 * - `role` required but   → redirect to home
 *   the user lacks it
 * Otherwise renders the protected children.
 */
export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role?: "ADMIN" | "CUSTOMER";
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
