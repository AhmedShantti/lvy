import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, ShoppingBag, Users, Package, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { Page, StatCard, Card, LoadingRow, fmtMoney } from "./_shared";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#c7a87c",
  CONFIRMED: "#b26f47",
  PACKED: "#8a5a3b",
  SHIPPED: "#6b4a2f",
  OUT_FOR_DELIVERY: "#4a3523",
  DELIVERED: "#2b1f13",
  CANCELLED: "#999999",
  REFUNDED: "#d64545",
};

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export default function AdminOverview() {
  const [days, setDays] = useState(30);

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

  const ts = useQuery({
    queryKey: ["admin-stats-timeseries", days],
    queryFn: async () => (await api.get("/admin/stats/timeseries", { params: { days } })).data,
  });

  return (
    <Page
      title="Overview"
      subtitle={`Last ${days} days of activity`}
      actions={
        <div className="flex border border-charcoal/15">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-4 py-2 text-xs uppercase tracking-wider transition ${
                days === r.days ? "bg-charcoal text-cream" : "hover:bg-sand/40"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Revenue (paid)" value={stats.data ? fmtMoney(stats.data.revenue) : "—"} accent />
        <StatCard label="Orders" value={stats.data?.orders ?? "—"} />
        <StatCard label="Customers" value={stats.data?.customers ?? "—"} />
        <StatCard label="Products" value={stats.data?.products ?? "—"} />
      </div>

      {/* Revenue chart */}
      <div className="grid lg:grid-cols-3 gap-4 mb-10">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Revenue · {days} days</p>
              <p className="font-display text-3xl mt-2 tabular-nums">
                {ts.data ? fmtMoney(ts.data.series.reduce((s: number, d: any) => s + d.revenue, 0)) : "—"}
              </p>
            </div>
            <div className="text-xs text-muted flex items-center gap-2">
              <TrendingUp size={14} className="text-sage" /> Paid orders only
            </div>
          </div>
          {!ts.data ? (
            <div className="h-64 bg-sand/40 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={ts.data.series}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b26f47" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#b26f47" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b1f1310" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  tick={{ fontSize: 10, fill: "#6b4a2f" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fontSize: 10, fill: "#6b4a2f" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "#2b1f13", border: "none", color: "#f4ede1", fontSize: 12 }}
                  formatter={(v: any) => [fmtMoney(v), "Revenue"]}
                  labelFormatter={(d) => new Date(d).toLocaleDateString()}
                />
                <Area type="monotone" dataKey="revenue" stroke="#b26f47" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Orders by status */}
        <Card className="p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-6">Orders by status</p>
          {!ts.data ? (
            <div className="h-64 bg-sand/40 animate-pulse" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={ts.data.byStatus}
                    dataKey="_count"
                    nameKey="status"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {ts.data.byStatus.map((s: any) => (
                      <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#999"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#2b1f13", border: "none", color: "#f4ede1", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-4">
                {ts.data.byStatus.map((s: any) => (
                  <div key={s.status} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[s.status] ?? "#999" }}
                    />
                    <span className="flex-1 text-muted">{s.status.replace(/_/g, " ")}</span>
                    <span className="tabular-nums">{s._count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Top products + Low stock */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Top-selling pieces</p>
            <Package size={14} className="text-muted" />
          </div>
          {!ts.data ? <LoadingRow /> : ts.data.topItems.length === 0 ? (
            <p className="text-sm text-muted">No sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ts.data.topItems} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#6b4a2f" }}
                  width={140}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "#2b1f13", border: "none", color: "#f4ede1", fontSize: 12 }}
                  formatter={(v: any) => [`${v} sold`, "Units"]}
                />
                <Bar dataKey="_sum.quantity" fill="#b26f47" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Low stock alerts</p>
            <AlertTriangle size={14} className="text-terracotta" />
          </div>
          {!ts.data ? <LoadingRow /> : ts.data.lowStock.length === 0 ? (
            <p className="text-sm text-muted">Everything's well-stocked.</p>
          ) : (
            <div className="space-y-3">
              {ts.data.lowStock.map((p: any) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="flex items-center gap-3 p-2 hover:bg-sand/40 transition"
                >
                  <img src={p.images[0]} alt="" className="w-10 h-10 object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted">SKU {p.slug}</p>
                  </div>
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      p.stock === 0 ? "text-terracotta" : "text-charcoal"
                    }`}
                  >
                    {p.stock === 0 ? "Sold out" : `${p.stock} left`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        {[
          { to: "/admin/orders", icon: ShoppingBag, label: "Manage orders" },
          { to: "/admin/products", icon: Package, label: "Edit catalog" },
          { to: "/admin/customers", icon: Users, label: "View customers" },
          { to: "/admin/reviews", icon: TrendingUp, label: "Moderate reviews" },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="p-6 border border-charcoal/10 bg-cream hover:border-charcoal transition flex items-center gap-4"
            >
              <Icon size={20} className="text-terracotta" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
