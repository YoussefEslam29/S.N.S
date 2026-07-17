"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Star,
  StarOff,
  Trash2,
  Clock,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingOverlay } from "@/components/LoadingOverlay";

interface ReviewAdminItem {
  _id: string;
  customerName: string;
  rating: number;
  text: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewAdminItem[]>([]);
  const [filterTab, setFilterTab] = useState<"pending" | "approved" | "all">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reviews?all=true");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filtered = reviews.filter((r) => {
    const matchSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) || r.text.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      filterTab === "all" ||
      (filterTab === "pending" && !r.isApproved) ||
      (filterTab === "approved" && r.isApproved);
    return matchSearch && matchTab;
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  const approveReview = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to approve review");
      }
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isApproved: true } : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectReview = async (id: string) => {
    if (!confirm("Are you sure you want to reject and delete this review?")) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete review");
      }
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFeatured = async (id: string) => {
    const review = reviews.find((r) => r._id === id);
    if (!review) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !review.isFeatured }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to toggle featured");
      }
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isFeatured: !r.isFeatured } : r))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete review");
      }
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-error">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingOverlay show={actionLoading} message="Processing review..." />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Reviews
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Moderate customer reviews. Approved reviews appear on the public site.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {(
            [
              { id: "pending", label: "Pending", count: pendingCount },
              { id: "approved", label: "Approved" },
              { id: "all", label: "All" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors",
                filterTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary"
              )}
            >
              {tab.label}
              {"count" in tab && tab.count! > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full h-9 pl-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary outline-none transition-colors"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.map((review) => (
          <div
            key={review._id}
            className={cn(
              "p-5 rounded-[4px] border bg-surface transition-colors",
              review.isApproved ? "border-border" : "border-warning/30 bg-warning/[0.02]"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">
                    {review.customerName}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3.5 h-3.5",
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-border"
                        )}
                      />
                    ))}
                  </div>
                  {!review.isApproved && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-[4px] bg-warning/10 text-warning">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                  {review.isFeatured && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-[4px] bg-amber-500/10 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(review.createdAt).toLocaleDateString("en", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!review.isApproved ? (
                  <>
                    <button
                      onClick={() => approveReview(review._id)}
                      className="p-2 rounded-[4px] text-success hover:bg-success/10 transition-colors"
                      title="Approve"
                      aria-label="Approve review"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => rejectReview(review._id)}
                      className="p-2 rounded-[4px] text-error hover:bg-error/10 transition-colors"
                      title="Reject"
                      aria-label="Reject review"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleFeatured(review._id)}
                      className={cn(
                        "p-2 rounded-[4px] transition-colors",
                        review.isFeatured
                          ? "text-amber-400 hover:bg-amber-500/10"
                          : "text-text-muted hover:text-amber-400 hover:bg-amber-500/10"
                      )}
                      title={review.isFeatured ? "Remove from featured" : "Feature on homepage"}
                      aria-label={review.isFeatured ? "Remove from featured" : "Feature on homepage"}
                    >
                      {review.isFeatured ? (
                        <Star className="w-5 h-5 fill-amber-400" />
                      ) : (
                        <StarOff className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteReview(review._id)}
                      className="p-2 rounded-[4px] text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete"
                      aria-label="Delete review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">
            {filterTab === "pending"
              ? "No pending reviews — you're all caught up!"
              : "No reviews found."}
          </div>
        )}
      </div>
    </div>
  );
}
