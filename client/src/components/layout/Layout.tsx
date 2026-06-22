import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  // The admin console has its own sidebar chrome — hide the storefront nav/footer there.
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
