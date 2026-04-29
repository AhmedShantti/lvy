import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save, Check } from "lucide-react";
import { api } from "@/lib/api";
import { Page, Card, LoadingRow } from "./_shared";

const GROUPS = [
  {
    title: "Storefront",
    fields: [
      { key: "storeName", label: "Store name", type: "text" },
      { key: "supportEmail", label: "Support email", type: "text" },
      { key: "currency", label: "Currency", type: "text" },
    ],
  },
  {
    title: "Pricing & tax",
    fields: [
      { key: "taxRate", label: "Tax rate (decimal, e.g. 0.08 = 8%)", type: "number" },
      { key: "freeShippingThreshold", label: "Free shipping over ($)", type: "number" },
      { key: "standardShipping", label: "Standard shipping ($)", type: "number" },
      { key: "expressShipping", label: "Express shipping ($)", type: "number" },
      { key: "whiteGloveShipping", label: "White glove shipping ($)", type: "number" },
    ],
  },
  {
    title: "Socials",
    fields: [
      { key: "socials.instagram", label: "Instagram URL", type: "text" },
      { key: "socials.twitter", label: "Twitter URL", type: "text" },
      { key: "socials.pinterest", label: "Pinterest URL", type: "text" },
    ],
  },
];

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

export default function AdminSettings() {
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => (await api.get("/admin/settings")).data,
  });

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Page title="Settings"><LoadingRow /></Page>;

  return (
    <Page
      title="Settings"
      subtitle="Store configuration"
      actions={
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? "Saved" : saving ? "Saving…" : "Save settings"}
        </button>
      }
    >
      <div className="space-y-6 max-w-2xl">
        {GROUPS.map((g) => (
          <Card key={g.title} className="p-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta mb-6">{g.title}</p>
            <div className="space-y-5">
              {g.fields.map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    step={f.type === "number" ? "any" : undefined}
                    value={getPath(form, f.key) ?? ""}
                    onChange={(e) =>
                      setForm(setPath(form, f.key, f.type === "number" ? Number(e.target.value) : e.target.value))
                    }
                    className="w-full border-b border-charcoal/20 bg-transparent py-2 outline-none focus:border-charcoal transition"
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}
