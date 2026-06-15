import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Check, Trash2, CheckSquare, Square, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { toast, errMessage } from "@/store/toast";
import { Page, Card, LoadingRow, EmptyState, fmtDate } from "./_shared";

const TABS = [
  { id: "pending", label: "Pending moderation" },
  { id: "approved", label: "Published" },
] as const;

export default function AdminReviews() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [selected, setSelected] = useState<string[]>([]);

  const reviews = useQuery({
    queryKey: ["admin-reviews", tab],
    queryFn: async () => (await api.get("/admin/reviews", { params: { status: tab } })).data,
  });

  const approve = async (id: string) => {
    try {
      await api.patch(`/admin/reviews/${id}/approve`);
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review approved");
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const reject = async (id: string) => {
    try {
      await api.patch(`/admin/reviews/${id}/reject`);
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review unpublished");
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review deleted");
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const bulkApprove = async () => {
    if (selected.length === 0) return;
    try {
      await api.post("/admin/reviews/bulk-approve", { ids: selected });
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      setSelected([]);
      toast.success(`Approved ${selected.length} review${selected.length === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const items = reviews.data?.items ?? [];
  const allSelected = items.length > 0 && selected.length === items.length;

  return (
    <Page
      title="Reviews"
      subtitle={`${items.length} review${items.length === 1 ? "" : "s"}`}
      actions={
        tab === "pending" && items.length > 0 ? (
          <div className="flex gap-3">
            <button
              onClick={() => setSelected(allSelected ? [] : items.map((r: any) => r.id))}
              className="btn btn-outline"
            >
              {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
              {allSelected ? "Clear" : "Select all"}
            </button>
            {selected.length > 0 && (
              <button onClick={bulkApprove} className="btn btn-primary">
                <Check size={14} /> Approve {selected.length}
              </button>
            )}
          </div>
        ) : null
      }
    >
      <div className="flex gap-6 border-b border-charcoal/10 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-3 text-xs uppercase tracking-[0.3em] relative transition ${
              tab === t.id ? "text-charcoal" : "text-muted hover:text-charcoal"
            }`}
          >
            {t.label}
            {tab === t.id && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-charcoal" />}
          </button>
        ))}
      </div>

      {reviews.isLoading ? <LoadingRow /> :
        items.length === 0 ? <EmptyState title={tab === "pending" ? "Nothing to moderate" : "No published reviews yet"} /> :
        <div className="space-y-4">
          {items.map((r: any) => (
            <Card key={r.id} className={`p-6 ${selected.includes(r.id) ? "ring-2 ring-terracotta" : ""}`}>
              <div className="flex items-start gap-4">
                {tab === "pending" && (
                  <button onClick={() => toggleSelect(r.id)} className="mt-1">
                    {selected.includes(r.id) ? (
                      <CheckSquare size={16} className="text-terracotta" />
                    ) : (
                      <Square size={16} className="text-muted" />
                    )}
                  </button>
                )}
                {r.product?.images?.[0] && (
                  <img src={r.product.images[0]} alt="" className="w-16 h-16 object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-muted">
                        Review on <span className="text-charcoal font-medium">{r.product?.name ?? "Unknown"}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1,2,3,4,5].map((n) => (
                            <Star key={n} size={12} className={n <= r.rating ? "fill-terracotta text-terracotta" : "text-charcoal/20"} />
                          ))}
                        </div>
                        <p className="text-xs text-muted">by {r.user?.name ?? "Anonymous"} · {fmtDate(r.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!r.approved ? (
                        <button
                          onClick={() => approve(r.id)}
                          className="px-3 py-1.5 bg-sage text-cream text-xs uppercase tracking-wider hover:bg-sage/90 flex items-center gap-1.5"
                        >
                          <Check size={12} /> Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => reject(r.id)}
                          className="px-3 py-1.5 border border-charcoal/20 text-xs uppercase tracking-wider hover:bg-charcoal hover:text-cream flex items-center gap-1.5"
                        >
                          <EyeOff size={12} /> Unpublish
                        </button>
                      )}
                      <button
                        onClick={() => remove(r.id)}
                        className="px-3 py-1.5 border border-terracotta/40 text-terracotta hover:bg-terracotta hover:text-cream text-xs uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                  {r.title && <p className="font-medium mt-3">{r.title}</p>}
                  <p className="text-sm text-muted mt-1 leading-relaxed">{r.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    </Page>
  );
}
