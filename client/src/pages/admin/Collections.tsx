import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast, errMessage } from "@/store/toast";
import { Page, Card, LoadingRow, EmptyState, Modal } from "./_shared";

interface CollectionForm {
  id?: string; name: string; slug: string; description?: string; cover?: string;
}

const empty: CollectionForm = { name: "", slug: "", description: "", cover: "" };

export default function AdminCollections() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CollectionForm | null>(null);

  const collections = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => (await api.get("/admin/collections")).data,
  });

  const save = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        await api.put(`/admin/collections/${editing.id}`, editing);
        toast.success("Collection updated");
      } else {
        await api.post("/admin/collections", editing);
        toast.success("Collection created");
      }
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      setEditing(null);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    try {
      await api.delete(`/admin/collections/${id}`);
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      toast.success("Collection deleted");
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const items = collections.data?.items ?? [];

  return (
    <Page
      title="Collections"
      subtitle={`${items.length} collection${items.length === 1 ? "" : "s"}`}
      actions={
        <button onClick={() => setEditing({ ...empty })} className="btn btn-primary">
          <Plus size={16} /> New collection
        </button>
      }
    >
      {collections.isLoading ? <LoadingRow /> :
        items.length === 0 ? <EmptyState title="No collections" body="Group pieces into curated collections." /> :
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((c: any) => (
            <Card key={c.id} className="overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden bg-sand/40">
                {c.cover && <img src={c.cover} alt={c.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <p className="font-display text-lg">{c.name}</p>
                <p className="text-xs text-muted tabular-nums mb-3">{c.slug} · {c._count?.products ?? 0} pieces</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing({
                      id: c.id, name: c.name, slug: c.slug,
                      description: c.description ?? "", cover: c.cover ?? "",
                    })}
                    className="flex-1 px-3 py-1.5 border border-charcoal/20 text-xs uppercase tracking-wider hover:bg-charcoal hover:text-cream flex items-center justify-center gap-1.5"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="px-3 py-1.5 border border-terracotta/40 text-terracotta text-xs hover:bg-terracotta hover:text-cream"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit collection" : "New collection"}>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Name</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Slug</label>
              <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Description</label>
              <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full border border-charcoal/20 bg-transparent p-2 outline-none text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Cover image URL</label>
              <input value={editing.cover ?? ""} onChange={(e) => setEditing({ ...editing, cover: e.target.value })} className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none text-xs font-mono" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditing(null)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn btn-primary flex-1">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </Page>
  );
}
