import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast, errMessage } from "@/store/toast";
import { Page, Card, LoadingRow, EmptyState, Modal, fmtMoney } from "./_shared";

interface ZoneForm {
  id?: string;
  name: string;
  postalPrefix: string;
  standard: number;
  express: number;
  whiteGlove: number;
}

const empty: ZoneForm = { name: "", postalPrefix: "", standard: 0, express: 0, whiteGlove: 0 };

export default function AdminShippingZones() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ZoneForm | null>(null);

  const zones = useQuery({
    queryKey: ["admin-shipping-zones"],
    queryFn: async () => (await api.get("/admin/shipping-zones")).data,
  });

  const save = async () => {
    if (!editing) return;
    const payload = {
      name: editing.name,
      postalPrefix: editing.postalPrefix,
      standard: Number(editing.standard),
      express: Number(editing.express),
      whiteGlove: Number(editing.whiteGlove),
    };
    try {
      if (editing.id) {
        await api.put(`/admin/shipping-zones/${editing.id}`, payload);
        toast.success("Zone updated");
      } else {
        await api.post("/admin/shipping-zones", payload);
        toast.success("Zone created");
      }
      qc.invalidateQueries({ queryKey: ["admin-shipping-zones"] });
      setEditing(null);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this shipping zone?")) return;
    try {
      await api.delete(`/admin/shipping-zones/${id}`);
      qc.invalidateQueries({ queryKey: ["admin-shipping-zones"] });
      toast.success("Zone deleted");
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const items = zones.data?.items ?? [];

  return (
    <Page
      title="Shipping Zones"
      subtitle={`${items.length} zone${items.length === 1 ? "" : "s"}`}
      actions={
        <button onClick={() => setEditing({ ...empty })} className="btn btn-primary">
          <Plus size={16} /> New zone
        </button>
      }
    >
      <Card>
        {zones.isLoading ? <div className="p-6"><LoadingRow /></div> :
          items.length === 0 ? <EmptyState title="No shipping zones" body="Define delivery rates by postal prefix." /> :
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-[10px] uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="text-left p-4">Zone</th>
                <th className="text-left p-4">Postal prefix</th>
                <th className="text-right p-4">Standard</th>
                <th className="text-right p-4">Express</th>
                <th className="text-right p-4">White glove</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((z: any) => (
                <tr key={z.id} className="border-t border-charcoal/5 hover:bg-sand/30 transition">
                  <td className="p-4 font-medium">{z.name}</td>
                  <td className="p-4 text-muted tabular-nums">{z.postalPrefix}</td>
                  <td className="p-4 text-right tabular-nums">{fmtMoney(z.standard)}</td>
                  <td className="p-4 text-right tabular-nums">{fmtMoney(z.express)}</td>
                  <td className="p-4 text-right tabular-nums">{fmtMoney(z.whiteGlove)}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setEditing({
                          id: z.id, name: z.name, postalPrefix: z.postalPrefix,
                          standard: Number(z.standard), express: Number(z.express), whiteGlove: Number(z.whiteGlove),
                        })}
                        className="p-2 hover:bg-charcoal/5"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => remove(z.id)} className="p-2 hover:bg-terracotta/10 text-terracotta">
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit zone" : "New zone"}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Name</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Postal prefix</label>
              <input value={editing.postalPrefix} onChange={(e) => setEditing({ ...editing, postalPrefix: e.target.value })} placeholder="e.g. 10 or 9" className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Standard ($)</label>
              <input type="number" step="any" value={editing.standard} onChange={(e) => setEditing({ ...editing, standard: Number(e.target.value) })} className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Express ($)</label>
              <input type="number" step="any" value={editing.express} onChange={(e) => setEditing({ ...editing, express: Number(e.target.value) })} className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">White glove ($)</label>
              <input type="number" step="any" value={editing.whiteGlove} onChange={(e) => setEditing({ ...editing, whiteGlove: Number(e.target.value) })} className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal" />
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
