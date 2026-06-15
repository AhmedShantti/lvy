import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast, errMessage } from "@/store/toast";
import { Page, Card, LoadingRow, EmptyState, Modal, fmtDate } from "./_shared";

interface CouponForm {
  id?: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minTotal?: number;
  expiresAt?: string;
  active: boolean;
}

const empty: CouponForm = { code: "", type: "percent", value: 10, active: true };

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CouponForm | null>(null);

  const coupons = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => (await api.get("/admin/coupons")).data,
  });

  const save = async () => {
    if (!editing) return;
    const payload = {
      ...editing,
      value: Number(editing.value),
      minTotal: editing.minTotal ? Number(editing.minTotal) : undefined,
      expiresAt: editing.expiresAt ? new Date(editing.expiresAt).toISOString() : undefined,
    };
    try {
      if (editing.id) {
        await api.put(`/admin/coupons/${editing.id}`, payload);
        toast.success("Coupon updated");
      } else {
        await api.post("/admin/coupons", payload);
        toast.success("Coupon created");
      }
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      setEditing(null);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted");
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await api.patch(`/admin/coupons/${id}/toggle`);
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const items = coupons.data?.items ?? [];

  return (
    <Page
      title="Coupons"
      subtitle={`${items.length} coupon${items.length === 1 ? "" : "s"}`}
      actions={
        <button onClick={() => setEditing({ ...empty })} className="btn btn-primary">
          <Plus size={16} /> New coupon
        </button>
      }
    >
      <Card>
        {coupons.isLoading ? <div className="p-6"><LoadingRow /></div> :
          items.length === 0 ? <EmptyState title="No coupons" body="Create a promo code for your customers." /> :
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-[10px] uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="text-left p-4">Code</th>
                <th className="text-left p-4">Discount</th>
                <th className="text-left p-4">Min total</th>
                <th className="text-left p-4">Expires</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c: any) => (
                <tr key={c.id} className="border-t border-charcoal/5 hover:bg-sand/30 transition">
                  <td className="p-4 font-display text-lg tabular-nums">{c.code}</td>
                  <td className="p-4">
                    {c.type === "percent" ? `${c.value}%` : `$${c.value}`}
                  </td>
                  <td className="p-4 text-muted">{c.minTotal ? `$${c.minTotal}` : "—"}</td>
                  <td className="p-4 text-muted">{c.expiresAt ? fmtDate(c.expiresAt) : "Never"}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(c.id)}
                      title="Toggle active"
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 transition ${
                        c.active ? "bg-emerald-700 text-cream hover:bg-emerald-800" : "bg-charcoal/10 text-muted hover:bg-charcoal/20"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setEditing({
                          id: c.id, code: c.code, type: c.type, value: Number(c.value),
                          minTotal: c.minTotal ? Number(c.minTotal) : undefined,
                          expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : undefined,
                          active: c.active,
                        })}
                        className="p-2 hover:bg-charcoal/5"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => remove(c.id)} className="p-2 hover:bg-terracotta/10 text-terracotta">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit coupon" : "New coupon"}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Code</label>
              <input
                value={editing.code}
                onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none font-display text-lg tabular-nums"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Type</label>
              <select
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value as any })}
                className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Value</label>
              <input
                type="number"
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })}
                className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Minimum total ($)</label>
              <input
                type="number"
                value={editing.minTotal ?? ""}
                onChange={(e) => setEditing({ ...editing, minTotal: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Expires at</label>
              <input
                type="datetime-local"
                value={editing.expiresAt ?? ""}
                onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })}
                className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="col-span-2 flex gap-3 mt-4">
              <button onClick={() => setEditing(null)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn btn-primary flex-1">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </Page>
  );
}
