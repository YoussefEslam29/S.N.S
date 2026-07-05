"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Star,
  StarOff,
  Trash2,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewAdminItem {
  id: string;
  customerName: string;
  rating: number;
  text: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

/* ─── Placeholder data ─── */
const initialReviews: ReviewAdminItem[] = [
  { id: "1", customerName: "Ahmed M.", rating: 5, text: "Best car wash in Alexandria! The ceramic coating made my car look brand new. Professional service and fair pricing.", isApproved: true, isFeatured: true, createdAt: "2025-06-15" },
  { id: "2", customerName: "Mohamed K.", rating: 5, text: "Got PPF installed on my BMW. Incredible quality work.", isApproved: true, isFeatured: true, createdAt: "2025-05-28" },
  { id: "3", customerName: "Sara A.", rating: 5, text: "Finally a car care shop that shows prices upfront. The full wash package at 300 EGP is excellent value.", isApproved: true, isFeatured: false, createdAt: "2025-06-01" },
  { id: "4", customerName: "Omar H.", rating: 4, text: "Great interior detailing service. They took their time with my Land Cruiser.", isApproved: true, isFeatured: false, createdAt: "2025-05-10" },
  { id: "5", customerName: "New Customer 1", rating: 5, text: "Amazing service, very professional team. Will come back for ceramic coating next month.", isApproved: false, isFeatured: false, createdAt: "2025-07-04" },
  { id: "6", customerName: "New Customer 2", rating: 3, text: "Good wash but the wait was a bit long. Otherwise satisfied with the quality.", isApproved: false, isFeatured: false, createdAt: "2025-07-05" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews);
  const [filterTab, setFilterTab] = useState<"pending" | "approved" | "all">("pending");
  const [search, setSearch] = useState("");

  const filtered = reviews.filter((r) => {
    const matchSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) || r.text.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      filterTab === "all" ||
      (filterTab === "pending" && !r.isApproved) ||
      (filterTab === "approved" && r.isApproved);
    return matchSearch && matchTab;
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  const approveReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
    );
  };

  const rejectReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleFeatured = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFeatured: !r.isFeatured } : r))
    );
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
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
            key={review.id}
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
                      onClick={() => approveReview(review.id)}
                      className="p-2 rounded-[4px] text-success hover:bg-success/10 transition-colors"
                      title="Approve"
                      aria-label="Approve review"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => rejectReview(review.id)}
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
                      onClick={() => toggleFeatured(review.id)}
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
                      onClick={() => deleteReview(review.id)}
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
