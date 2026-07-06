"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Placeholder gallery items (will be replaced with API data) ─── */
const galleryItems = [
  {
    id: "1",
    title: "BMW X5 — Full PPF Wrap",
    category: "ppf",
    vehicleType: "suv",
    description: "Complete paint protection film applied to a BMW X5. Self-healing film protects against scratches and road debris.",
  },
  {
    id: "2",
    title: "Mercedes C-Class — Ceramic Coating",
    category: "ceramic-coating",
    vehicleType: "sedan",
    description: "Multi-layer ceramic coating for maximum gloss and 3-year protection.",
  },
  {
    id: "3",
    title: "Toyota Land Cruiser — Interior Detail",
    category: "detailing",
    vehicleType: "truck",
    description: "Deep interior cleaning, leather conditioning, and carpet extraction.",
  },
  {
    id: "4",
    title: "Hyundai Tucson — Window Tinting",
    category: "tinting",
    vehicleType: "suv",
    description: "Premium ceramic window tint for heat rejection and UV protection.",
  },
  {
    id: "5",
    title: "Kia Cerato — Premium Wash",
    category: "wash",
    vehicleType: "sedan",
    description: "Full inside-out wash with chemical wiping and motor cleaning.",
  },
  {
    id: "6",
    title: "Range Rover — PPF Front End",
    category: "ppf",
    vehicleType: "suv",
    description: "Front bumper, hood, fenders, and mirrors protected with clear PPF.",
  },
];

const categories = [
  { id: "all", label: "All" },
  { id: "wash", label: "Car Wash" },
  { id: "detailing", label: "Detailing" },
  { id: "ceramic-coating", label: "Ceramic Coating" },
  { id: "ppf", label: "PPF" },
  { id: "tinting", label: "Tinting" },
];

export default function GalleryPage() {
  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = filter === "all"
    ? galleryItems
    : galleryItems.filter((item) => item.category === filter);

  return (
    <div className="py-12 md:py-20">
      <div className="container-sns">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            Our Work
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Real transformations on real cars. See the quality of our work before you book.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-[4px] transition-all duration-200",
                filter === cat.id
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-[4/3] rounded-[4px] border border-border bg-surface overflow-hidden animate-fade-in-up text-left"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Placeholder gradient (replace with real images) */}
              <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface" />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <h3 className="text-sm font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {item.description}
                </p>
                <span className="mt-2 inline-flex px-2 py-0.5 text-[10px] bg-primary/20 text-primary rounded-[4px] w-fit uppercase tracking-wider">
                  {item.category.replace("-", " ")}
                </span>
              </div>

              {/* Always visible title on mobile */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent md:hidden">
                <h3 className="text-sm font-medium text-text-primary">
                  {item.title}
                </h3>
              </div>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-muted">No items in this category yet.</p>
          </div>
        )}

        {/* Promo Videos Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-6 text-center">
            Watch Our Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "S.N.S Car Care Showreel", src: "/videos/promo-1.mp4" },
              { title: "Professional Detailing Process", src: "/videos/promo-2.mp4" },
            ].map((video, i) => (
              <div
                key={i}
                className="aspect-video rounded-[4px] border border-border bg-surface-elevated flex items-center justify-center"
              >
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-primary/10">
                    <Play className="w-6 h-6 text-primary ml-0.5" />
                  </div>
                  <p className="text-sm text-text-secondary">{video.title}</p>
                  <p className="text-xs text-text-muted">Coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox (simplified) */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Placeholder for actual image */}
            <div className="aspect-[16/9] rounded-[4px] bg-surface-elevated border border-border mb-4 flex items-center justify-center">
              <p className="text-text-muted text-sm">
                {filtered[lightboxIndex]?.title} — Before / After
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-text-primary">
                {filtered[lightboxIndex]?.title}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                {filtered[lightboxIndex]?.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setLightboxIndex(Math.max(0, lightboxIndex - 1))}
                disabled={lightboxIndex === 0}
                className="p-2 rounded-[4px] bg-surface-elevated border border-border text-text-secondary hover:text-text-primary disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-text-muted py-2">
                {lightboxIndex + 1} / {filtered.length}
              </span>
              <button
                onClick={() => setLightboxIndex(Math.min(filtered.length - 1, lightboxIndex + 1))}
                disabled={lightboxIndex === filtered.length - 1}
                className="p-2 rounded-[4px] bg-surface-elevated border border-border text-text-secondary hover:text-text-primary disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
