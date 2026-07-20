"use client";

import { useState, useEffect } from "react";
import { Star, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface ReviewData {
  _id: string;
  customerName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const { locale } = useLanguage();

  // Reviews from API
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    rating: 0,
    text: "",
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Fetch approved reviews from the database
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoadingReviews(true);
        const res = await fetch("/api/reviews");
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        setReviews(data.data ?? []);
      } catch {
        // Silently fail — empty state will be shown
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, []);

  // Compute average rating from real data
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

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
              ({reviews.length} {locale === "ar" ? "تقييم" : "reviews"})
            </span>
          </div>
          <p className="text-text-secondary max-w-lg mx-auto">
            {locale === "ar"
              ? "تقييمات حقيقية من عملائنا. نحن نفخر بكل سيارة نعتني بها."
              : "Real feedback from our customers. We're proud of every car we care for."}
          </p>
        </div>

        {/* Reviews Grid */}
        {loadingReviews ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 mb-16 rounded-[4px] border border-border border-dashed bg-surface/30">
            <Star className="w-10 h-10 mx-auto text-text-muted/30 mb-3" />
            <p className="text-text-muted text-sm">
              {locale === "ar"
                ? "لا توجد تقييمات حتى الآن. كن أول من يترك تقييم!"
                : "No reviews yet. Be the first to leave a review!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {reviews.map((review, i) => (
              <div
                key={review._id}
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
                    {new Date(review.createdAt).toLocaleDateString(locale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

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
