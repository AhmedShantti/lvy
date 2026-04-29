import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { Page, Card, LoadingRow, EmptyState, fmtDate, fmtMoney } from "./_shared";

export default function AdminCustomers() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const customers = useQuery({
    queryKey: ["admin-customers", q, page],
    queryFn: async () =>
      (await api.get("/admin/customers", { params: { q: q || undefined, page, limit: 25 } })).data,
  });

  const filtered = customers.data?.items ?? [];
  const total = customers.data?.total ?? 0;
  const pages = customers.data?.pages ?? 1;

  return (
    <Page title="Customers" subtitle={`${total} registered`}>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="w-full pl-9 pr-3 py-2.5 border border-charcoal/15 bg-cream outline-none focus:border-charcoal transition text-sm"
          />
        </div>
      </div>

      <Card>
        {customers.isLoading ? <div className="p-6"><LoadingRow /></div> :
          filtered.length === 0 ? <EmptyState title="No customers" /> :
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-[10px] uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-right p-4">Orders</th>
                <th className="text-right p-4">Reviews</th>
                <th className="text-right p-4">Lifetime value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => (
                <tr
                  key={c.id}
                  onClick={() => setOpenId(c.id)}
                  className="border-t border-charcoal/5 hover:bg-sand/30 cursor-pointer transition"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-terracotta/15 flex items-center justify-center text-terracotta font-display">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{fmtDate(c.createdAt)}</td>
                  <td className="p-4 text-right tabular-nums">{c.orderCount}</td>
                  <td className="p-4 text-right tabular-nums">{c.reviewCount}</td>
                  <td className="p-4 text-right tabular-nums font-medium">{fmtMoney(c.lifetimeValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>

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

      {openId && <CustomerDrawer id={openId} onClose={() => setOpenId(null)} />}
    </Page>
  );
}

function CustomerDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-customer", id],
    queryFn: async () => (await api.get(`/admin/customers/${id}`)).data,
  });
  const c = data?.customer;

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-charcoal/50 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-cream shadow-2xl overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-charcoal/10 sticky top-0 bg-cream z-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Customer</p>
            <p className="font-display text-2xl mt-1">{c?.name ?? "…"}</p>
          </div>
          <button onClick={onClose}><X size={22} /></button>
        </div>

        {isLoading || !c ? <div className="p-6"><LoadingRow /></div> : (
          <div className="p-6 space-y-8">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-muted" />
              <a href={`mailto:${c.email}`} className="text-sm underline">{c.email}</a>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-sand/40">
                <p className="text-[10px] uppercase tracking-wider text-muted">Orders</p>
                <p className="font-display text-2xl mt-1">{c.orders.length}</p>
              </div>
              <div className="p-4 bg-sand/40">
                <p className="text-[10px] uppercase tracking-wider text-muted">Reviews</p>
                <p className="font-display text-2xl mt-1">{c.reviews.length}</p>
              </div>
              <div className="p-4 bg-sand/40">
                <p className="text-[10px] uppercase tracking-wider text-muted">Joined</p>
                <p className="text-sm mt-1">{fmtDate(c.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">Order history</p>
              {c.orders.length === 0 ? (
                <p className="text-sm text-muted">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {c.orders.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between p-3 border border-charcoal/10 text-sm">
                      <div>
                        <p className="font-medium tabular-nums">{o.number}</p>
                        <p className="text-xs text-muted">{fmtDate(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? "" : "s"}</p>
                      </div>
                      <div className="text-right">
                        <p className="tabular-nums">{fmtMoney(o.total)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted">{o.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {c.addresses.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">Addresses</p>
                <div className="space-y-2">
                  {c.addresses.map((a: any) => (
                    <div key={a.id} className="text-sm p-3 border border-charcoal/10">
                      <p>{a.fullName}</p>
                      <p className="text-muted text-xs">{a.line1}, {a.city}, {a.region} {a.postal}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
