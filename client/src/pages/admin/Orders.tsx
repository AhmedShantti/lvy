import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { toast, errMessage } from "@/store/toast";
import { Page, Card, LoadingRow, EmptyState, fmtDate, fmtMoney } from "./_shared";

const STATUSES = ["PENDING","CONFIRMED","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED","REFUNDED"];

export default function AdminOrders() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const orders = useQuery({
    queryKey: ["admin-orders", page, q, statusFilter],
    queryFn: async () =>
      (await api.get("/admin/orders-paged", {
        params: { page, limit: 20, q: q || undefined, status: statusFilter || undefined },
      })).data,
  });

  const filtered = orders.data?.items ?? [];
  const total = orders.data?.total ?? 0;
  const pages = orders.data?.pages ?? 1;

  const exportCsv = async () => {
    const token = localStorage.getItem("lvy.token");
    const res = await fetch(`${api.defaults.baseURL}/admin/orders.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lvy-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      toast.success(`Status set to ${status.replace(/_/g, " ")}`);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  return (
    <Page
      title="Orders"
      subtitle={`${total} order${total === 1 ? "" : "s"}`}
      actions={
        <button onClick={exportCsv} className="btn btn-outline">
          <Download size={14} /> Export CSV
        </button>
      }
    >
      {/* Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by order # or email"
            className="w-full pl-9 pr-3 py-2.5 border border-charcoal/15 bg-cream outline-none focus:border-charcoal transition text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-charcoal/15 bg-cream outline-none text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <Card>
        {orders.isLoading ? <div className="p-6"><LoadingRow /></div> :
          filtered.length === 0 ? <EmptyState title="No orders found" /> :
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-[10px] uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="text-left p-4">Order</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: any) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                  className="border-t border-charcoal/5 hover:bg-sand/30 cursor-pointer transition"
                >
                  <td className="p-4 font-medium tabular-nums">{o.number}</td>
                  <td className="p-4">
                    <p>{o.email}</p>
                    {!o.userId && <span className="text-[10px] uppercase tracking-wider text-terracotta">Guest</span>}
                  </td>
                  <td className="p-4 text-muted">{fmtDate(o.createdAt)}</td>
                  <td className="p-4 tabular-nums">{fmtMoney(o.total)}</td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => { e.stopPropagation(); updateStatus(o.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs bg-transparent border border-charcoal/20 px-2 py-1"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase tracking-wider ${
                      o.paymentStatus === "PAID" ? "text-emerald-700" :
                      o.paymentStatus === "REFUNDED" ? "text-terracotta" : "text-muted"
                    }`}>{o.paymentStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm">
          <p className="text-muted">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-charcoal/20 disabled:opacity-40 hover:bg-charcoal hover:text-cream transition"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-2 border border-charcoal/20 disabled:opacity-40 hover:bg-charcoal hover:text-cream transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </Page>
  );
}
