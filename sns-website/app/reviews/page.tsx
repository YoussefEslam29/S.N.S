"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Placeholder reviews (will be replaced with API data) ─── */
const placeholderReviews = [
  {
    id: "1",
    customerName: "Ahmed M.",
    rating: 5,
    text: "Best car wash in Alexandria! The ceramic coating made my car look brand new. Professional service and fair pricing.",
    createdAt: "2025-06-15",
  },
  {
    id: "2",
    customerName: "Mohamed K.",
    rating: 5,
    text: "Got PPF installed on my BMW. Incredible quality work. The team really knows what they're doing with paint protection.",
    createdAt: "2025-05-28",
  },
  {
    id: "3",
    customerName: "Sara A.",
    rating: 5,
    text: "Finally a car care shop that shows prices upfront. The full wash package at 300 EGP is excellent value. Will definitely be back!",
    createdAt: "2025-06-01",
  },
  {
    id: "4",
    customerName: "Omar H.",
    rating: 4,
    text: "Great interior detailing service. They took their time with my Land Cruiser and the result was amazing. Only minor issue was the wait time.",
    createdAt: "2025-05-10",
  },
  {
    id: "5",
    customerName: "Nour E.",
    rating: 5,
    text: "The ceramic window tint on my Tucson is perfect. Great heat rejection and the team was very professional. Highly recommend!",
    createdAt: "2025-06-20",
  },
  {
    id: "6",
    customerName: "Hassan R.",
    rating: 5,
    text: "Had PPF installed on the full front end of my Mercedes. Flawless installation, no bubbles, invisible protection. Worth every pound.",
    createdAt: "2025-04-22",
  },
];

export default function ReviewsPage() {
  const [formData, setFormData] = useState({
    customerName: "",
    rating: 0,
    text: "",
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Compute average rating
  const avgRating =
    placeholderReviews.reduce((sum, r) => sum + r.rating, 0) /
    placeholderReviews.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.customerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (formData.rating < 1) {
      setError("Please select a rating");
      return;
    }
    if (!formData.text.trim()) {
      setError("Please write your review");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setSubmitted(true);
      setFormData({ customerName: "", rating: 0, text: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 md:py-20">
      <div className="container-sns">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            Customer Reviews
          </h1>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-border"
                  )}
                />
              ))}
            </div>
            <span className="text-lg font-heading font-bold text-text-primary">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-text-muted text-sm">
              ({placeholderReviews.length} reviews)
            </span>
          </div>
          <p className="text-text-secondary max-w-lg mx-auto">
            Real feedback from our customers. We're proud of every car we care
            for.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {placeholderReviews.map((review, i) => (
            <div
              key={review.id}
              className="p-6 rounded-[4px] bg-surface border border-border hover:border-primary/20 transition-colors animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Rating */}
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className={cn(
                      "w-4 h-4",
                      j < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-border"
                    )}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Author & Date */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary">
                  {review.customerName}
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(review.createdAt).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Leave a Review Section */}
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
              Leave a Review
            </h2>
            <p className="text-sm text-text-secondary">
              Had your car serviced at S.N.S? We'd love to hear from you. Your
              review will be published after approval.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-[4px] bg-surface border border-success/30 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                Thank you!
              </h3>
              <p className="text-sm text-text-secondary">
                Your review has been submitted and will be published once
                approved by our team.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                Submit another review
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6 rounded-[4px] bg-surface border border-border space-y-4"
            >
              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-[4px] bg-error/10 border border-error/20 text-error text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label
                  htmlFor="review-name"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  Your Name <span className="text-error">*</span>
                </label>
                <input
                  id="review-name"
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Enter your name"
                  className="w-full h-10 px-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
                  maxLength={200}
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Rating <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() =>
                        setFormData({ ...formData, rating: star })
                      }
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={cn(
                          "w-7 h-7 transition-colors",
                          (hoverRating || formData.rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-border hover:text-amber-400/50"
                        )}
                      />
                    </button>
                  ))}
                  {formData.rating > 0 && (
                    <span className="ml-2 text-sm text-text-muted">
                      {formData.rating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label
                  htmlFor="review-text"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  Your Review <span className="text-error">*</span>
                </label>
                <textarea
                  id="review-text"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  placeholder="Tell us about your experience..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors resize-none"
                  maxLength={2000}
                />
                <p className="text-[10px] text-text-muted text-right mt-1">
                  {formData.text.length}/2000
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold rounded-[4px] text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
