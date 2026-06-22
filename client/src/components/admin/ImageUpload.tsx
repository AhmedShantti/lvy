import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/upload";
import { toast, errMessage } from "@/store/toast";

/**
 * Single-image field: upload a file (stored in Supabase Storage) or paste a URL.
 * `value` is the stored image URL; `onChange` receives the new URL ("" to clear).
 */
export default function ImageUpload({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-muted block mb-2">{label}</label>
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 border border-charcoal/15 bg-sand/30 flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted">No image</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="btn btn-outline text-xs disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {busy ? "Uploading…" : "Upload image"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-3 py-1.5 border border-terracotta/40 text-terracotta text-xs hover:bg-terracotta hover:text-cream flex items-center gap-1.5"
              >
                <X size={12} /> Remove
              </button>
            )}
          </div>
          <input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="w-full border-b border-charcoal/20 bg-transparent py-1.5 outline-none text-xs font-mono"
          />
        </div>
      </div>
    </div>
  );
}
