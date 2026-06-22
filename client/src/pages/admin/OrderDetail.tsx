import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, RefreshCcw, User, UserCheck, MapPin, Package, Truck, Tag, Mail, Phone,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast, errMessage } from "@/store/toast";
import { Page, Card, LoadingRow, EmptyState, fmtDate, fmtMoney } from "./_shared";

const STATUSES = ["PENDING","CONFIRMED","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED","REFUNDED"];
const PAYMENT_STATUSES = ["PENDING","PAID","FAILED","REFUNDED"];

const TIER_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  EXPRESS: "Express",
  WHITE_GLOVE: "White Glove (assembly & placement)",
};

export default function AdminOrderDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const d = (await api.get(`/admin/orders/${id}`)).data;
      setNotes(d.order.notes ?? "");
      setNotesDirty(false);
      return d;
    },
    enabled: !!id,
  });

  const order = data?.order;

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`Status set to ${status.replace(/_/g, " ")}`);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const updatePayment = async (paymentStatus: string) => {
    try {
      await api.patch(`/admin/orders/${id}/payment`, { paymentStatus });
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`Payment set to ${paymentStatus}`);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

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

  const backLink = (
    <Link to="/admin/orders" className="btn btn-outline">
      <ArrowLeft size={14} /> Back to orders
    </Link>
  );

  if (isLoading) {
    return <Page title="Order" actions={backLink}><LoadingRow /></Page>;
  }
  if (!order) {
    return (
      <Page title="Order" actions={backLink}>
        <EmptyState title="Order not found" body="This order may have been deleted." />
      </Page>
    );
  }

  return (
    <Page
      title={order.number}
      subtitle={`Placed ${fmtDate(order.createdAt)}`}
      actions={backLink}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left: details ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {order.user ? <UserCheck size={15} className="text-sage" /> : <User size={15} className="text-stone" />}
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Customer</p>
              {order.user ? (
                <span className="text-[10px] uppercase tracking-wider bg-charcoal/10 text-muted px-2 py-0.5">Registered</span>
              ) : (
                <span className="text-[10px] uppercase tracking-wider bg-terracotta/15 text-terracotta px-2 py-0.5">Guest</span>
              )}
            </div>
            <p className="font-medium">{order.user?.name ?? order.address?.fullName ?? "—"}</p>
            <div className="mt-2 space-y-1 text-sm text-muted">
              <p className="flex items-center gap-2">
                <Mail size={13} /> <a href={`mailto:${order.email}`} className="underline">{order.email}</a>
              </p>
              {order.address?.phone && (
                <p className="flex items-center gap-2"><Phone size={13} /> {order.address.phone}</p>
              )}
              {order.user && (
                <p className="text-xs">Member since {fmtDate(order.user.createdAt)}</p>
              )}
            </div>
          </Card>

          {/* Shipping address */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={15} className="text-muted" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Shipping address</p>
            </div>
            {order.address ? (
              <div className="text-sm leading-relaxed">
                <p className="font-medium">{order.address.fullName}</p>
                <p className="text-muted">{order.address.line1}</p>
                {order.address.line2 && <p className="text-muted">{order.address.line2}</p>}
                <p className="text-muted">{order.address.city}, {order.address.region} {order.address.postal}</p>
                <p className="text-muted">{order.address.country}</p>
              </div>
            ) : (
              <p className="text-sm text-muted">No address on file.</p>
            )}
          </Card>

          {/* Delivery */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={15} className="text-muted" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Delivery</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>{TIER_LABELS[order.deliveryTier] ?? order.deliveryTier}</span>
              <span className="tabular-nums">{Number(order.shipping) === 0 ? "Free" : fmtMoney(order.shipping)}</span>
            </div>
            {order.shipment?.trackingCode && (
              <p className="mt-2 text-xs text-muted">
                {order.shipment.carrier ? `${order.shipment.carrier} · ` : ""}Tracking {order.shipment.trackingCode}
              </p>
            )}
          </Card>

          {/* Items */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} className="text-muted" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
                Items · {order.items.length} line{order.items.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="space-y-4">
              {order.items.map((i: any) => (
                <div key={i.id} className="flex gap-4 text-sm">
                  {i.image && <img src={i.image} alt="" className="w-16 h-16 object-cover flex-shrink-0 border border-charcoal/10" />}
                  <div className="flex-1">
                    <p className="font-medium">{i.name}</p>
                    {i.variant && <p className="text-xs text-muted">{i.variant}</p>}
                    <p className="text-xs text-muted">Qty {i.quantity} · {fmtMoney(i.price)} each</p>
                  </div>
                  <p className="tabular-nums">{fmtMoney(Number(i.price) * i.quantity)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Internal notes */}
          <Card className="p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">Internal notes</p>
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
          </Card>
        </div>

        {/* ── Right: status + totals ── */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-6 space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Order status</p>
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="w-full px-3 py-2 border border-charcoal/20 bg-cream text-sm"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Payment status</p>
              <select
                value={order.paymentStatus}
                onChange={(e) => updatePayment(e.target.value)}
                className="w-full px-3 py-2 border border-charcoal/20 bg-cream text-sm"
              >
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={refund}
              disabled={refunding || order.paymentStatus === "REFUNDED"}
              className="w-full px-4 py-2 border border-terracotta text-terracotta hover:bg-terracotta hover:text-cream transition text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCcw size={14} />
              {order.paymentStatus === "REFUNDED" ? "Refunded" : refunding ? "Processing…" : "Refund order"}
            </button>
          </Card>

          <Card className="p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-4">Summary</p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{fmtMoney(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="tabular-nums">{Number(order.shipping) === 0 ? "Free" : fmtMoney(order.shipping)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd className="tabular-nums">{fmtMoney(order.tax)}</dd></div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-terracotta">
                  <dt className="flex items-center gap-1.5"><Tag size={12} /> Discount{order.couponCode ? ` · ${order.couponCode}` : ""}</dt>
                  <dd className="tabular-nums">−{fmtMoney(order.discount)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-charcoal/10 pt-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted">Total</span>
              <span className="font-display text-3xl tabular-nums">{fmtMoney(order.total)}</span>
            </div>
          </Card>
        </aside>
      </div>
    </Page>
  );
}
