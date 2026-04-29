import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, X, GripVertical } from "lucide-react";
import { api } from "@/lib/api";
import { Page, Card, LoadingRow, EmptyState, Modal, fmtMoney } from "./_shared";
import MediaPicker from "@/components/admin/MediaPicker";

interface ProductForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt?: number;
  images: string[];  // now an array
  categoryId: string;
  stock: number;
  material?: string;
  color?: string;
  dimensions?: string;
  featured: boolean;
  isNew: boolean;
}

const empty: ProductForm = {
  name: "", slug: "", description: "", price: 0, images: [],
  categoryId: "", stock: 0, featured: false, isNew: false,
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [variantsFor, setVariantsFor] = useState<{ id: string; name: string } | null>(null);

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await api.get("/products", { params: { limit: 48 } })).data,
  });
  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const filtered = useMemo(
    () => (products.data?.items ?? []).filter((p: any) => p.name.toLowerCase().includes(q.toLowerCase())),
    [products.data, q]
  );

  const save = async () => {
    if (!editing) return;
    const payload = {
      ...editing,
      price: Number(editing.price),
      compareAt: editing.compareAt ? Number(editing.compareAt) : undefined,
      stock: Number(editing.stock),
    };
    if (editing.id) {
      await api.put(`/admin/products/${editing.id}`, payload);
    } else {
      await api.post("/admin/products", payload);
    }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    setEditing(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await api.delete(`/admin/products/${id}`);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <Page
      title="Products"
      subtitle={`${filtered.length} piece${filtered.length === 1 ? "" : "s"}`}
      actions={
        <button onClick={() => setEditing({ ...empty })} className="btn btn-primary">
          <Plus size={16} /> New product
        </button>
      }
    >
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="w-full pl-9 pr-3 py-2.5 border border-charcoal/15 bg-cream outline-none focus:border-charcoal transition text-sm"
          />
        </div>
      </div>

      <Card>
        {products.isLoading ? <div className="p-6"><LoadingRow /></div> :
          filtered.length === 0 ? <EmptyState title="No products" /> :
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-[10px] uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="text-left p-4">Piece</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Flags</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-t border-charcoal/5 hover:bg-sand/30 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-12 h-12 object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted tabular-nums">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{p.category?.name ?? "—"}</td>
                  <td className="p-4 tabular-nums">{fmtMoney(p.price)}</td>
                  <td className="p-4 tabular-nums">
                    <span className={p.stock === 0 ? "text-terracotta" : p.stock <= 5 ? "text-terracotta/80" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {p.featured && <span className="text-[9px] uppercase tracking-wider bg-charcoal text-cream px-2 py-0.5">Featured</span>}
                      {p.isNew && <span className="text-[9px] uppercase tracking-wider bg-terracotta text-cream px-2 py-0.5">New</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setEditing({
                          id: p.id,
                          name: p.name,
                          slug: p.slug,
                          description: p.description,
                          price: Number(p.price),
                          compareAt: p.compareAt ? Number(p.compareAt) : undefined,
                          images: p.images ?? [],
                          categoryId: p.categoryId,
                          stock: p.stock,
                          material: p.material ?? "",
                          color: p.color ?? "",
                          dimensions: p.dimensions ?? "",
                          featured: p.featured,
                          isNew: p.isNew,
                        })}
                        className="p-2 hover:bg-charcoal/5"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setVariantsFor({ id: p.id, name: p.name })} className="p-2 hover:bg-charcoal/5 text-xs uppercase tracking-wider">
                        Variants
                      </button>
                      <button onClick={() => remove(p.id)} className="p-2 hover:bg-terracotta/10 text-terracotta">
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit product" : "New product"}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field label="Slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
            <Field label="Price" type="number" value={editing.price} onChange={(v) => setEditing({ ...editing, price: Number(v) })} />
            <Field label="Compare at (optional)" type="number" value={editing.compareAt ?? ""} onChange={(v) => setEditing({ ...editing, compareAt: v ? Number(v) : undefined })} />
            <Field label="Stock" type="number" value={editing.stock} onChange={(v) => setEditing({ ...editing, stock: Number(v) })} />
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Category</label>
              <select
                value={editing.categoryId}
                onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}
                className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none"
              >
                <option value="">Select…</option>
                {(cats.data?.items ?? []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Field label="Material" value={editing.material ?? ""} onChange={(v) => setEditing({ ...editing, material: v })} />
            <Field label="Color" value={editing.color ?? ""} onChange={(v) => setEditing({ ...editing, color: v })} />
            <Field label="Dimensions" value={editing.dimensions ?? ""} onChange={(v) => setEditing({ ...editing, dimensions: v })} />
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">Description</label>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                className="w-full border border-charcoal/20 bg-transparent p-2 outline-none text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">
                Images · click to reorder, drag to rearrange
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {editing.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("from", String(i))}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const from = Number(e.dataTransfer.getData("from"));
                      if (from === i) return;
                      const next = [...editing.images];
                      const [moved] = next.splice(from, 1);
                      next.splice(i, 0, moved);
                      setEditing({ ...editing, images: next });
                    }}
                  >
                    <img src={img} alt="" className="w-20 h-24 object-cover border border-charcoal/10 cursor-move" />
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition flex items-center justify-center">
                      <GripVertical size={16} className="text-cream opacity-0 group-hover:opacity-100" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing({ ...editing, images: editing.images.filter((_, j) => j !== i) })}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-terracotta text-cream opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    >
                      <X size={11} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] uppercase tracking-wider text-cream bg-charcoal/70 px-1 py-0.5 text-center">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setMediaOpen(true)}
                  className="w-20 h-24 border-2 border-dashed border-charcoal/20 hover:border-charcoal flex flex-col items-center justify-center transition gap-1"
                >
                  <ImageIcon size={18} className="text-muted" />
                  <span className="text-[9px] uppercase tracking-wider text-muted">Pick</span>
                </button>
              </div>
            </div>
            <div className="col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isNew} onChange={(e) => setEditing({ ...editing, isNew: e.target.checked })} />
                Mark as new
              </label>
            </div>
            <div className="col-span-2 flex gap-3 mt-4">
              <button onClick={() => setEditing(null)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={save} className="btn btn-primary flex-1">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {mediaOpen && editing && (
        <MediaPicker
          multi
          selected={editing.images}
          onClose={() => setMediaOpen(false)}
          onPick={(arr) => {
            setEditing({ ...editing, images: arr as string[] });
            setMediaOpen(false);
          }}
        />
      )}

      {variantsFor && (
        <VariantsDrawer
          productId={variantsFor.id}
          productName={variantsFor.name}
          onClose={() => setVariantsFor(null)}
        />
      )}
    </Page>
  );
}

function VariantsDrawer({ productId, productName, onClose }: {
  productId: string; productName: string; onClose: () => void;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any>(null);

  const { data } = useQuery({
    queryKey: ["admin-variants", productId],
    queryFn: async () => (await api.get("/admin/variants", { params: { productId } })).data,
  });

  const save = async () => {
    if (!draft) return;
    const payload = {
      productId,
      name: draft.name,
      sku: draft.sku,
      color: draft.color || undefined,
      size: draft.size || undefined,
      price: Number(draft.price),
      stock: Number(draft.stock ?? 0),
    };
    if (draft.id) await api.put(`/admin/variants/${draft.id}`, payload);
    else await api.post("/admin/variants", payload);
    qc.invalidateQueries({ queryKey: ["admin-variants", productId] });
    setDraft(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this variant?")) return;
    await api.delete(`/admin/variants/${id}`);
    qc.invalidateQueries({ queryKey: ["admin-variants", productId] });
  };

  const items = data?.items ?? [];

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-charcoal/50 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-cream shadow-2xl overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-charcoal/10 sticky top-0 bg-cream z-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Variants</p>
            <p className="font-display text-xl mt-1">{productName}</p>
          </div>
          <button onClick={onClose}><X size={22} /></button>
        </div>

        <div className="p-6">
          <button
            onClick={() => setDraft({ name: "", sku: "", price: 0, stock: 0 })}
            className="btn btn-outline w-full mb-4"
          >
            <Plus size={14} /> New variant
          </button>

          {items.length === 0 && !draft ? (
            <p className="text-sm text-muted text-center py-6">No variants yet.</p>
          ) : (
            <div className="space-y-3">
              {items.map((v: any) => (
                <div key={v.id} className="border border-charcoal/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-muted">{v.sku} · ${Number(v.price).toFixed(0)} · {v.stock} in stock</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setDraft(v)} className="p-1.5 hover:bg-charcoal/5"><Edit2 size={12} /></button>
                      <button onClick={() => remove(v.id)} className="p-1.5 hover:bg-terracotta/10 text-terracotta"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {draft && (
            <div className="mt-6 border border-charcoal/15 p-5 bg-sand/30 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-terracotta">{draft.id ? "Edit variant" : "New variant"}</p>
              {[
                ["name", "Name", "text"],
                ["sku", "SKU", "text"],
                ["color", "Color", "text"],
                ["size", "Size", "text"],
                ["price", "Price override", "number"],
                ["stock", "Stock", "number"],
              ].map(([k, label, type]) => (
                <div key={k}>
                  <label className="text-[10px] uppercase tracking-wider text-muted block mb-1">{label}</label>
                  <input
                    type={type}
                    value={draft[k] ?? ""}
                    onChange={(e) => setDraft({ ...draft, [k]: type === "number" ? Number(e.target.value) : e.target.value })}
                    className="w-full border-b border-charcoal/20 bg-transparent py-1.5 outline-none text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setDraft(null)} className="btn btn-outline flex-1">Cancel</button>
                <button onClick={save} className="btn btn-primary flex-1">Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal transition"
      />
    </div>
  );
}
