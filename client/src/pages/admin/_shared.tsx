import { ReactNode } from "react";

export function Page({ title, subtitle, actions, children }: {
  title: string; subtitle?: string; actions?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="p-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-2">Admin</p>
          <h1 className="font-display text-4xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-cream border border-charcoal/10 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, delta, accent }: {
  label: string; value: string | number; delta?: string; accent?: boolean;
}) {
  return (
    <div className={`p-6 border ${accent ? "bg-charcoal text-cream border-charcoal" : "bg-cream border-charcoal/10"}`}>
      <p className={`text-[10px] uppercase tracking-[0.3em] ${accent ? "text-cream/60" : "text-muted"}`}>{label}</p>
      <p className="font-display text-4xl mt-3 tabular-nums">{value}</p>
      {delta && <p className={`text-xs mt-2 ${accent ? "text-cream/70" : "text-sage"}`}>{delta}</p>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="py-20 text-center border border-dashed border-charcoal/15">
      <p className="font-display text-2xl mb-2">{title}</p>
      {body && <p className="text-muted mb-6 max-w-md mx-auto">{body}</p>}
      {action}
    </div>
  );
}

export function LoadingRow() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 bg-sand/40 animate-pulse" />
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 backdrop-blur-sm p-4">
      <div className="bg-cream max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-charcoal text-2xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function fmtMoney(n: number | string | null | undefined) {
  return `EGP ${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
