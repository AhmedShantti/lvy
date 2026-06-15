import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X, RefreshCcw, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { toast, errMessage } from "@/store/toast";
import { Page, Card, LoadingRow, EmptyState, fmtDate, fmtMoney } from "./_shared";

const STATUSES = ["PENDING","CONFIRMED","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED","REFUNDED"];
const PAYMENT_STATUSES = ["PENDING","PAID","FAILED","REFUNDED"];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);
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
      if (openId) qc.invalidateQueries({ queryKey: ["admin-order", openId] });
      toast.success(`Status set to ${status.replace(/_/g, " ")}`);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const updatePayment = async (id: string, paymentStatus: string) => {
    try {
      await api.patch(`/admin/orders/${id}/payment`, { paymentStatus });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      if (openId) qc.invalidateQueries({ queryKey: ["admin-order", openId] });
      toast.success(`Payment set to ${paymentStatus}`);
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
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order # or email"
            className="w-full pl-9 pr-3 py-2.5 border border-charcoal/15 bg-cream outline-none focus:border-charcoal transition text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
                  onClick={() => setOpenId(o.id)}
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
                      o.paymentStatus === "PAID" ? "text-sage" :
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

      {openId && <OrderDrawer id={openId} onClose={() => setOpenId(null)} onStatusChange={updateStatus} onPaymentChange={updatePayment} />}
    </Page>
  );
}

function OrderDrawer({ id, onClose, onStatusChange, onPaymentChange }: {
  id: string; onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onPaymentChange: (id: string, paymentStatus: string) => void;
}) {
  const qc = useQueryClient();
  const [refunding, setRefunding] = useState(false);
  const [notes, setNotes] = useState<string>("");
  const [notesDirty, setNotesDirty] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const d = (await api.get(`/admin/orders/${id}`)).data;
      setNotes(d.order.notes ?? "");
      setNotesDirty(false);
      return d;
    },
  });

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.patch(`/admin/orders/${id}/notes`, { notes });
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      setNotesDirty(false);
      toast.success("Note saved");
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setSavingNotes(false);
    }
  };

  const refund = async () => {
    if (!confirm("Refund this order? This will mark it as REFUNDED and cannot be undone here.")) return;
    setRefunding(true);
    try {
      await api.post(`/admin/orders/${id}/refund`);
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order refunded");
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setRefunding(false);
    }
  };

  const order = data?.order;

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-charcoal/50 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-cream shadow-2xl overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-charcoal/10 sticky top-0 bg-cream z-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Order detail</p>
            <p className="font-display text-2xl tabular-nums mt-1">{order?.number ?? "…"}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-charcoal">
            <X size={22} />
          </button>
        </div>

        {isLoading || !order ? (
          <div className="p-6"><LoadingRow /></div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Status + actions */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Status</p>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-charcoal/20 bg-cream text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
                <button
                  onClick={refund}
                  disabled={refunding || order.paymentStatus === "REFUNDED"}
                  className="px-4 py-2 border border-terracotta text-terracotta hover:bg-terracotta hover:text-cream transition text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCcw size={14} />
                  {order.paymentStatus === "REFUNDED" ? "Refunded" : refunding ? "Processing…" : "Refund"}
                </button>
              </div>
            </div>

            {/* Payment status */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Payment status</p>
              <select
                value={order.paymentStatus}
                onChange={(e) => onPaymentChange(order.id, e.target.value)}
                className="w-full px-3 py-2 border border-charcoal/20 bg-cream text-sm"
              >
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Customer */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">Customer</p>
              <p className="text-sm">{order.email}</p>
              {order.user ? (
                <p className="text-xs text-muted mt-1">
                  Registered · Member since {fmtDate(order.user.createdAt)}
                </p>
              ) : (
                <p className="text-xs text-terracotta mt-1">Guest checkout</p>
              )}
            </div>

            {/* Shipping */}
            {order.address && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">Ship to</p>
                <p className="text-sm">{order.address.fullName}</p>
                <p className="text-sm text-muted">{order.address.line1}</p>
                {order.address.line2 && <p className="text-sm text-muted">{order.address.line2}</p>}
                <p className="text-sm text-muted">
                  {order.address.city}, {order.address.region} {order.address.postal}
                </p>
                <p className="text-sm text-muted">{order.address.country}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">Items</p>
              <div className="space-y-3">
                {order.items.map((i: any) => (
                  <div key={i.id} className="flex gap-3 text-sm">
                    {i.image && <img src={i.image} alt="" className="w-14 h-14 object-cover flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="font-medium">{i.name}</p>
                      <p className="text-xs text-muted">Qty {i.quantity} · {fmtMoney(i.price)}</p>
                    </div>
                    <p className="tabular-nums">{fmtMoney(Number(i.price) * i.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Internal notes</p>
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
                rows={3}
                placeholder="Add a private note for the team…"
                className="w-full border border-charcoal/20 bg-cream p-3 text-sm outline-none focus:border-charcoal"
              />
              {notesDirty && (
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="mt-2 text-xs uppercase tracking-wider border-b border-charcoal pb-0.5 disabled:opacity-50"
                >
                  {savingNotes ? "Saving…" : "Save note"}
                </button>
              )}
            </div>

            {/* Totals */}
            <div className="bg-sand/40 p-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="tabular-nums">{fmtMoney(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="tabular-nums">{fmtMoney(order.shipping)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Tax</span><span className="tabular-nums">{fmtMoney(order.tax)}</span></div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-terracotta"><span>Discount</span><span className="tabular-nums">−{fmtMoney(order.discount)}</span></div>
              )}
              <div className="flex justify-between font-display text-lg pt-3 border-t border-charcoal/10">
                <span>Total</span><span className="tabular-nums">{fmtMoney(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
