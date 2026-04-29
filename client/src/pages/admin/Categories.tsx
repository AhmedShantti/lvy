import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Page, Card, LoadingRow, EmptyState, Modal } from "./_shared";

interface CategoryForm {
  id?: string; name: string; slug: string; description?: string; image?: string;
}

const empty: CategoryForm = { name: "", slug: "", description: "", image: "" };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CategoryForm | null>(null);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const save = async () => {
    if (!editing) return;
    if (editing.id) {
      await api.put(`/admin/categories/${editing.id}`, editing);
    } else {
      await api.post("/admin/categories", editing);
    }
    qc.invalidateQueries({ queryKey: ["categories"] });
    setEditing(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await api.delete(`/admin/categories/${id}`);
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const items = categories.data?.items ?? [];

  return (
    <Page
      title="Categories"
      subtitle={`${items.length} categories`}
      actions={
        <button onClick={() => setEditing({ ...empty })} className="btn btn-primary">
          <Plus size={16} /> New category
        </button>
      }
    >
      {categories.isLoading ? <LoadingRow /> :
        items.length === 0 ? <EmptyState title="No categories" /> :
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((c: any) => (
            <Card key={c.id} className="overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden bg-sand/40">
                {c.image && <img src={c.image} alt={c.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <p className="font-display text-lg">{c.name}</p>
                <p className="text-xs text-muted tabular-nums mb-3">{c.slug} · {c._count?.products ?? 0} pieces</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing({
                      id: c.id, name: c.name, slug: c.slug,
                      description: c.description ?? "", image: c.image ?? "",
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit category" : "New category"}>
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
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Image URL</label>
              <input value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none text-xs font-mono" />
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
