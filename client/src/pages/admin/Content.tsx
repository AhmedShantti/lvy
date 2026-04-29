import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Eye, EyeOff, RotateCcw, Save, Image as ImageIcon, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import { Page, Card, LoadingRow } from "./_shared";
import MediaPicker from "@/components/admin/MediaPicker";

const SECTION_META: Record<string, { label: string; fields: Field[] }> = {
  hero: {
    label: "Hero",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "titleAccent", label: "Title accent (italic)", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "ctaPrimary.label", label: "Primary CTA label", type: "text" },
      { key: "ctaPrimary.to", label: "Primary CTA link", type: "text" },
      { key: "ctaSecondary.label", label: "Secondary CTA label", type: "text" },
      { key: "ctaSecondary.to", label: "Secondary CTA link", type: "text" },
      { key: "images", label: "Hero images", type: "images" },
    ],
  },
  story: {
    label: "Our Philosophy",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "titleAccent", label: "Title accent", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "quote", label: "Founder quote", type: "textarea" },
      { key: "quoteAttribution", label: "Quote attribution", type: "text" },
      { key: "pillars", label: "Pillars", type: "repeater", fields: [
        { key: "n", label: "Number", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "body", label: "Body", type: "text" },
      ]},
      { key: "stats", label: "Stats", type: "repeater", fields: [
        { key: "value", label: "Value", type: "text" },
        { key: "label", label: "Label", type: "text" },
      ]},
      { key: "images", label: "Story images (need 2)", type: "images" },
      { key: "ctaPrimary.label", label: "Primary CTA label", type: "text" },
      { key: "ctaPrimary.to", label: "Primary CTA link", type: "text" },
      { key: "ctaSecondary.label", label: "Secondary CTA label", type: "text" },
      { key: "ctaSecondary.to", label: "Secondary CTA link", type: "text" },
    ],
  },
  featured: {
    label: "Featured pieces",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "titleAccent", label: "Title accent", type: "text" },
      { key: "limit", label: "Max products", type: "number" },
    ],
  },
  categoryGrid: {
    label: "Shop by room",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "titleAccent", label: "Title accent", type: "text" },
    ],
  },
  scrollScene: {
    label: "Scroll showcase (3D)",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "panels", label: "Panels", type: "repeater", fields: [
        { key: "eyebrow", label: "Eyebrow", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "body", label: "Body", type: "textarea" },
      ]},
    ],
  },
};

type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "images" | "repeater";
  fields?: Field[];
};

function getPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

function setPath(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const last = keys.pop()!;
  const clone = JSON.parse(JSON.stringify(obj ?? {}));
  let cur = clone;
  for (const k of keys) {
    if (!cur[k]) cur[k] = {};
    cur = cur[k];
  }
  cur[last] = value;
  return clone;
}

export default function AdminContent() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const page = useQuery({
    queryKey: ["admin-content-home"],
    queryFn: async () => (await api.get("/admin/content/pages/home")).data,
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const saveSection = async (id: string) => {
    setSaving(id);
    try {
      const data = dirty[id];
      await api.put(`/admin/content/sections/${id}`, { data });
      qc.invalidateQueries({ queryKey: ["admin-content-home"] });
      qc.invalidateQueries({ queryKey: ["content-home"] });
      setDirty((d) => { const c = { ...d }; delete c[id]; return c; });
      setToast("Saved");
    } finally {
      setSaving(null);
    }
  };

  const toggleEnabled = async (id: string, enabled: boolean) => {
    await api.put(`/admin/content/sections/${id}`, { enabled });
    qc.invalidateQueries({ queryKey: ["admin-content-home"] });
    qc.invalidateQueries({ queryKey: ["content-home"] });
  };

  const resetAll = async () => {
    if (!confirm("Reset the home page to default content? All edits will be lost.")) return;
    await api.post("/admin/content/pages/home/reset");
    qc.invalidateQueries({ queryKey: ["admin-content-home"] });
    qc.invalidateQueries({ queryKey: ["content-home"] });
    setDirty({});
    setToast("Reset to defaults");
  };

  if (page.isLoading) return <Page title="Content"><LoadingRow /></Page>;

  const sections = page.data?.page?.sections ?? [];

  return (
    <Page
      title="Content · Home"
      subtitle="Edit the live marketing content for the home page"
      actions={
        <button onClick={resetAll} className="btn btn-outline">
          <RotateCcw size={14} /> Reset to defaults
        </button>
      }
    >
      <div className="space-y-3">
        {sections.map((s: any) => {
          const meta = SECTION_META[s.type];
          const isOpen = expanded === s.id;
          const currentData = dirty[s.id] ?? s.data;
          const isDirty = dirty[s.id] !== undefined;

          return (
            <Card key={s.id} className={isDirty ? "ring-2 ring-terracotta" : ""}>
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-sand/30"
                onClick={() => setExpanded(isOpen ? null : s.id)}
              >
                <div className="flex items-center gap-4">
                  <ChevronDown size={16} className={`transition ${isOpen ? "rotate-180" : ""}`} />
                  <div>
                    <p className="font-display text-lg">{meta?.label ?? s.type}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted">
                      {s.type} · position {s.order}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isDirty && <span className="text-[10px] uppercase tracking-wider text-terracotta">Unsaved</span>}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleEnabled(s.id, !s.enabled); }}
                    className={`flex items-center gap-1.5 text-xs uppercase tracking-wider transition ${
                      s.enabled ? "text-emerald-700" : "text-muted"
                    }`}
                  >
                    {s.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                    {s.enabled ? "Visible" : "Hidden"}
                  </button>
                </div>
              </div>

              {isOpen && meta && (
                <div className="border-t border-charcoal/10 p-6 bg-sand/20">
                  <div className="space-y-5 max-w-2xl">
                    {meta.fields.map((f) => (
                      <FieldInput
                        key={f.key}
                        field={f}
                        value={getPath(currentData, f.key)}
                        onChange={(v) => setDirty((d) => ({ ...d, [s.id]: setPath(currentData, f.key, v) }))}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => saveSection(s.id)}
                      disabled={!isDirty || saving === s.id}
                      className="btn btn-primary disabled:opacity-40"
                    >
                      <Save size={14} /> {saving === s.id ? "Saving…" : "Save section"}
                    </button>
                    {isDirty && (
                      <button
                        onClick={() => setDirty((d) => { const c = { ...d }; delete c[s.id]; return c; })}
                        className="btn btn-outline"
                      >
                        Discard
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-charcoal text-cream px-5 py-3 shadow-xl z-50">
          {toast}
        </div>
      )}
    </Page>
  );
}

function FieldInput({ field, value, onChange }: {
  field: Field; value: any; onChange: (v: any) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  if (field.type === "text") {
    return (
      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">{field.label}</label>
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal transition"
        />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">{field.label}</label>
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal transition"
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">{field.label}</label>
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full border border-charcoal/20 bg-cream p-3 outline-none focus:border-charcoal text-sm"
        />
      </div>
    );
  }

  if (field.type === "images") {
    const imgs: string[] = value ?? [];
    return (
      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">{field.label}</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {imgs.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} alt="" className="w-20 h-24 object-cover border border-charcoal/10" />
              <button
                onClick={() => onChange(imgs.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-terracotta text-cream opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setPickerOpen(true)}
            className="w-20 h-24 border-2 border-dashed border-charcoal/20 hover:border-charcoal flex items-center justify-center transition"
          >
            <Plus size={18} className="text-muted" />
          </button>
        </div>
        <button
          onClick={() => setPickerOpen(true)}
          className="text-xs uppercase tracking-[0.2em] text-muted hover:text-charcoal flex items-center gap-2"
        >
          <ImageIcon size={12} /> Browse library
        </button>
        {pickerOpen && (
          <MediaPicker
            multi
            selected={imgs}
            onClose={() => setPickerOpen(false)}
            onPick={(arr) => { onChange(arr); setPickerOpen(false); }}
          />
        )}
      </div>
    );
  }

  if (field.type === "repeater") {
    const items: any[] = Array.isArray(value) ? value : [];
    return (
      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">{field.label}</label>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-charcoal/15 p-4 bg-cream relative">
              <button
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="absolute top-2 right-2 text-muted hover:text-terracotta"
              >
                <X size={14} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {field.fields!.map((f) => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={item[f.key]}
                    onChange={(v) => {
                      const next = [...items];
                      next[i] = { ...next[i], [f.key]: v };
                      onChange(next);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => onChange([...items, {}])}
            className="text-xs uppercase tracking-[0.2em] text-muted hover:text-charcoal flex items-center gap-2"
          >
            <Plus size={12} /> Add item
          </button>
        </div>
      </div>
    );
  }

  return null;
}
