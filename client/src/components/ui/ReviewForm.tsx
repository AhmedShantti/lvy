import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/store/auth";

interface Props {
  productId: string;
  onSubmitted: () => void;
}

export default function ReviewForm({ productId, onSubmitted }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="border border-charcoal/15 p-8 text-center">
        <p className="font-display text-xl mb-2">Sign in to leave a review</p>
        <p className="text-sm text-muted mb-5">We want to make sure reviews come from real customers.</p>
        <Link to="/login" className="btn btn-primary">Sign in</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="border border-terracotta/30 bg-terracotta/5 p-8 text-center">
        <Check size={28} className="mx-auto text-terracotta mb-3" />
        <p className="font-display text-xl mb-1">Thank you!</p>
        <p className="text-sm text-muted">Your review is pending moderation and will appear shortly.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating < 1) return setError("Please choose a rating");
    if (body.trim().length < 10) return setError("Please write at least 10 characters");
    setSubmitting(true);
    try {
      await api.post("/reviews", { productId, rating, title: title || undefined, body });
      setDone(true);
      onSubmitted();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-charcoal/15 p-6 lg:p-8">
      <p className="font-display text-xl mb-1">Share your experience</p>
      <p className="text-sm text-muted mb-6">Reviewing as <span className="text-charcoal">{user.name}</span></p>

      <div className="mb-6">
        <label className="text-xs uppercase tracking-[0.3em] text-muted block mb-3">Your rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="p-1"
            >
              <Star
                size={24}
                className={
                  n <= (hover || rating)
                    ? "fill-terracotta text-terracotta"
                    : "text-charcoal/20"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs uppercase tracking-[0.3em] text-muted block mb-2">Title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="A quick headline"
          className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal py-2 outline-none transition"
        />
      </div>

      <div className="mb-6">
        <label className="text-xs uppercase tracking-[0.3em] text-muted block mb-2">Your review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="What do you love about this piece? How does it fit in your space?"
          className="w-full bg-transparent border border-charcoal/20 focus:border-charcoal p-3 outline-none transition resize-none"
        />
        <p className="text-xs text-muted mt-1 text-right">{body.length} / 2000</p>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-terracotta mb-4"
        >
          {error}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
