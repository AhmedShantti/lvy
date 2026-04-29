import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, X, Link2 } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  multi?: boolean;
  selected?: string[];
  onPick: (items: string[] | string) => void;
  onClose: () => void;
}

export default function MediaPicker({ multi = false, selected = [], onPick, onClose }: Props) {
  const [picked, setPicked] = useState<string[]>(selected);
  const [customUrl, setCustomUrl] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => (await api.get("/admin/media")).data,
  });

  const toggle = (url: string) => {
    if (multi) {
      setPicked((p) => (p.includes(url) ? p.filter((x) => x !== url) : [...p, url]));
    } else {
      setPicked([url]);
    }
  };

  const confirm = () => {
    if (multi) onPick(picked);
    else onPick(picked[0] ?? "");
  };

  const addCustom = () => {
    if (!customUrl.trim()) return;
    setPicked((p) => [...p, customUrl.trim()]);
    setCustomUrl("");
  };

  const files = data?.items ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/60 backdrop-blur-sm p-4">
      <div className="bg-cream max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-charcoal/10 sticky top-0 bg-cream z-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-terracotta">Media library</p>
            <h2 className="font-display text-2xl mt-1">Select images</h2>
          </div>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="p-6">
          {/* Custom URL */}
          <div className="mb-6 p-4 border border-charcoal/15 flex items-center gap-3">
            <Link2 size={16} className="text-muted flex-shrink-0" />
            <input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Or paste an external image URL (Unsplash, etc.)"
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button onClick={addCustom} className="text-xs uppercase tracking-wider border-b border-charcoal">
              Add
            </button>
          </div>

          {/* Files grid */}
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">
            From /client/public ({files.length})
          </p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {files.map((f: any) => {
              const isSelected = picked.includes(f.url);
              return (
                <button
                  key={f.url}
                  onClick={() => toggle(f.url)}
                  className={`relative aspect-square overflow-hidden border-2 transition ${
                    isSelected ? "border-terracotta" : "border-transparent hover:border-charcoal/20"
                  }`}
                >
                  <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-terracotta/20 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-terracotta flex items-center justify-center">
                        <Check size={14} className="text-cream" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Picked preview */}
          {picked.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">Selected ({picked.length})</p>
              <div className="flex flex-wrap gap-2">
                {picked.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-16 h-16 object-cover" />
                    <button
                      onClick={() => setPicked((p) => p.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-terracotta text-cream flex items-center justify-center text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-charcoal/10 sticky bottom-0 bg-cream">
            <button onClick={onClose} className="btn btn-outline flex-1">Cancel</button>
            <button onClick={confirm} className="btn btn-primary flex-1">
              Use {picked.length > 0 ? `(${picked.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
