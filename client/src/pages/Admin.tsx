import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "@/store/auth";
import {
  LayoutDashboard, ShoppingBag, Package, Users, Star, Tag, Layers, LogOut,
  FileText, Sliders,
} from "lucide-react";

import AdminOverview from "./admin/Overview";
import AdminOrders from "./admin/Orders";
import AdminProducts from "./admin/Products";
import AdminCustomers from "./admin/Customers";
import AdminReviews from "./admin/Reviews";
import AdminCategories from "./admin/Categories";
import AdminCoupons from "./admin/Coupons";
import AdminContent from "./admin/Content";
import AdminSettings from "./admin/Settings";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/categories", label: "Categories", icon: Layers },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Sliders },
];

export default function Admin() {
  const { user, logout } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (user.role !== "ADMIN") return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal text-cream flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-8 border-b border-cream/10">
          <p className="font-display text-2xl leading-none">lvy</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cream/50 mt-2">Admin Console</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm rounded transition ${
                    isActive
                      ? "bg-terracotta text-cream"
                      : "text-cream/60 hover:text-cream hover:bg-cream/5"
                  }`
                }
              >
                <Icon size={16} />
                {n.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-cream/10">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-cream/40 truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded text-cream/60 hover:text-cream hover:bg-cream/5 transition"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
}
