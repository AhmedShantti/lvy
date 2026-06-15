import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, ShieldCheck, User as UserIcon } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { toast, errMessage } from "@/store/toast";
import { Page, Card, LoadingRow, EmptyState, fmtDate } from "./_shared";

const ROLES = ["CUSTOMER", "ADMIN"] as const;

export default function AdminUsers() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const users = useQuery({
    queryKey: ["admin-users", q, roleFilter, page],
    queryFn: async () =>
      (await api.get("/admin/users", {
        params: { q: q || undefined, role: roleFilter || undefined, page, limit: 25 },
      })).data,
  });

  const changeRole = async (id: string, role: string) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`Role updated to ${role}`);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const items = users.data?.items ?? [];
  const total = users.data?.total ?? 0;
  const pages = users.data?.pages ?? 1;

  return (
    <Page title="Users" subtitle={`${total} account${total === 1 ? "" : "s"}`}>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by name or email"
            className="w-full pl-9 pr-3 py-2.5 border border-charcoal/15 bg-cream outline-none focus:border-charcoal transition text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-charcoal/15 bg-cream outline-none text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <Card>
        {users.isLoading ? <div className="p-6"><LoadingRow /></div> :
          items.length === 0 ? <EmptyState title="No users found" /> :
          <table className="w-full text-sm">
            <thead className="bg-sand/40 text-[10px] uppercase tracking-[0.2em] text-muted">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-right p-4">Orders</th>
                <th className="text-right p-4">Reviews</th>
                <th className="text-right p-4">Change role</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u: any) => {
                const isSelf = me?.id === u.id;
                return (
                  <tr key={u.id} className="border-t border-charcoal/5 hover:bg-sand/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-terracotta/15 flex items-center justify-center text-terracotta font-display">
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}{isSelf && <span className="text-muted font-normal"> · you</span>}</p>
                          <p className="text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 ${
                        u.role === "ADMIN" ? "bg-charcoal text-cream" : "bg-charcoal/10 text-muted"
                      }`}>
                        {u.role === "ADMIN" ? <ShieldCheck size={11} /> : <UserIcon size={11} />}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-muted">{fmtDate(u.createdAt)}</td>
                    <td className="p-4 text-right tabular-nums">{u._count?.orders ?? 0}</td>
                    <td className="p-4 text-right tabular-nums">{u._count?.reviews ?? 0}</td>
                    <td className="p-4 text-right">
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="text-xs bg-transparent border border-charcoal/20 px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={isSelf ? "You can't change your own role" : undefined}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
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
    </Page>
  );
}
