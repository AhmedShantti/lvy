import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertTriangle, Info, X } from "lucide-react";
import { useToasts } from "@/store/toast";

const ICONS = {
  success: Check,
  error: AlertTriangle,
  info: Info,
} as const;

const ACCENTS = {
  success: "border-l-emerald-700",
  error: "border-l-terracotta",
  info: "border-l-charcoal",
} as const;

export default function Toaster() {
  const { toasts, dismiss } = useToasts();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto bg-cream border border-charcoal/10 border-l-2 ${ACCENTS[t.kind]} shadow-xl flex items-start gap-3 p-4`}
            >
              <Icon
                size={16}
                className={
                  t.kind === "success" ? "text-emerald-700 mt-0.5" :
                  t.kind === "error" ? "text-terracotta mt-0.5" :
                  "text-charcoal mt-0.5"
                }
              />
              <p className="flex-1 text-sm text-charcoal leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-muted hover:text-charcoal transition shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
