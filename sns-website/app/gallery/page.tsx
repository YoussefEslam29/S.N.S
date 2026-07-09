"use client";

import React, { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

/* ─── Merged Gallery Items (Images + Videos) ─── */
interface GalleryItem {
  id: string;
  title: string;
  category: string;
  vehicleType: string;
  description: string;
  isVideo: boolean;
  src?: string;
}

const galleryItems: GalleryItem[] = [
  // ─── Videos ───
  {
    id: "v1",
    title: "S.N.S Premium Car Care Experience",
    category: "wash",
    vehicleType: "sedan",
    description: "A high-energy edit showing our full premium washing and detailing process in action.",
    src: "/videos/1-cc-edit-video.mp4",
    isVideo: true,
  },
  {
    id: "v2",
    title: "Ceramic Coating & PPF Protection",
    category: "ppf",
    vehicleType: "suv",
    description: "Witness the precision application of paint protection film and ceramic coating for extreme gloss and self-healing protection.",
    src: "/videos/2-cc-edit-video-polandpro.mp4",
    isVideo: true,
  },
  {
    id: "v3",
    title: "Interior Detailing & Restoration",
    category: "detailing",
    vehicleType: "sedan",
    description: "Deep interior steam cleaning, leather conditioning, and comprehensive fabric restoration.",
    src: "/videos/3-cc-edit-video.mp4",
    isVideo: true,
  },
  {
    id: "v4",
    title: "Elite Car Care & Shine Showreel",
    category: "ceramic-coating",
    vehicleType: "suv",
    description: "Cinematic showcase of our finished projects looking brand new and protected.",
    src: "/videos/3-cc-edit-video-pro.mp4",
    isVideo: true,
  },
  // ─── Image placeholders ───
  {
    id: "1",
    title: "BMW X5 — Full PPF Wrap",
    category: "ppf",
    vehicleType: "suv",
    description: "Complete paint protection film applied to a BMW X5. Self-healing film protects against scratches and road debris.",
    isVideo: false,
  },
  {
    id: "2",
    title: "Mercedes C-Class — Ceramic Coating",
    category: "ceramic-coating",
    vehicleType: "sedan",
    description: "Multi-layer ceramic coating for maximum gloss and 3-year protection.",
    isVideo: false,
  },
  {
    id: "3",
    title: "Toyota Land Cruiser — Interior Detail",
    category: "detailing",
    vehicleType: "truck",
    description: "Deep interior cleaning, leather conditioning, and carpet extraction.",
    isVideo: false,
  },
  {
    id: "4",
    title: "Hyundai Tucson — Window Tinting",
    category: "tinting",
    vehicleType: "suv",
    description: "Premium ceramic window tint for heat rejection and UV protection.",
    isVideo: false,
  },
  {
    id: "5",
    title: "Kia Cerato — Premium Wash",
    category: "wash",
    vehicleType: "sedan",
    description: "Full inside-out wash with chemical wiping and motor cleaning.",
    isVideo: false,
  },
  {
    id: "6",
    title: "Range Rover — PPF Front End",
    category: "ppf",
    vehicleType: "suv",
    description: "Front bumper, hood, fenders, and mirrors protected with clear PPF.",
    isVideo: false,
  },
];

const categories = [
  { id: "all", label: "All Works" },
  { id: "videos", label: "Videos" },
  { id: "wash", label: "Premium Wash" },
  { id: "detailing", label: "Detailing" },
  { id: "ppf", label: "PPF" },
  { id: "ceramic-coating", label: "Ceramic Coating" },
  { id: "tinting", label: "Tinting" },
];

/* ─── Video Card Subcomponent with Hover Play ─── */
function GalleryVideoCard({ item, onClick, index }: { item: GalleryItem; onClick: () => void; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useLanguage();

  const handleMouseEnter = async () => {
    setIsPlaying(true);
    if (videoRef.current) {
      try {
        await videoRef.current.play();
      } catch (err) {
        // Video play interrupted or blocked
      }
    }
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative aspect-[4/3] rounded-[8px] border border-border bg-surface overflow-hidden text-left cursor-pointer shadow-md hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={item.src}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Glassmorphic Play indicator tag top right */}
      <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-background/75 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
        <Play className="w-4 h-4 fill-primary text-primary ml-0.5" />
      </div>

      {/* Dark overlay & Information */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent flex flex-col justify-end p-5 z-10">
        <div className="space-y-1">
          <span className="inline-flex px-2 py-0.5 text-[9px] bg-primary/20 text-primary border border-primary/30 rounded-[4px] font-bold uppercase tracking-wider mb-2">
            {t("gallery." + (item.category === "ceramic-coating" ? "ceramicCoating" : item.category))}
          </span>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
      
      {/* Hover preview tooltip */}
      {!isPlaying && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[8px] text-white/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity z-20">
          {t("gallery.hoverToPreview")}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Image Card Subcomponent ─── */
function GalleryImageCard({ item, onClick, index }: { item: GalleryItem; onClick: () => void; index: number }) {
  const { t } = useLanguage();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative aspect-[4/3] rounded-[8px] border border-border bg-surface overflow-hidden text-left cursor-pointer shadow-md hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
      onClick={onClick}
    >
      {/* Elegant gradient placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated via-surface-elevated/40 to-background/20 transition-transform duration-700 group-hover:scale-105 flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary/10 group-hover:text-primary/25 group-hover:rotate-12 transition-all duration-500" />
      </div>

      {/* Dark overlay & Information */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent flex flex-col justify-end p-5 z-10">
        <div className="space-y-1">
          <span className="inline-flex px-2 py-0.5 text-[9px] bg-surface-elevated text-text-secondary border border-border rounded-[4px] font-medium uppercase tracking-wider mb-2">
            {t("gallery." + (item.category === "ceramic-coating" ? "ceramicCoating" : item.category))}
          </span>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Gallery Page ─── */
export default function GalleryPage() {
  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const getCategoryLabel = (id: string) => {
    switch (id) {
      case "all": return t("gallery.allWork");
      case "videos": return t("gallery.videos");
      case "wash": return t("gallery.carWash");
      case "detailing": return t("gallery.detailing");
      case "ceramic-coating": return t("gallery.ceramicCoating");
      case "ppf": return t("gallery.ppf");
      case "tinting": return t("gallery.tinting");
      default: return id;
    }
  };

  const filtered = filter === "all"
    ? galleryItems
    : filter === "videos"
      ? galleryItems.filter((item) => item.isVideo)
      : galleryItems.filter((item) => item.category === filter);

  const handleOpenLightbox = (item: GalleryItem) => {
    const idx = filtered.findIndex((f) => f.id === item.id);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  const featuredVideos = galleryItems.filter((item) => item.isVideo);

  return (
    <div className="py-12 md:py-20 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="container-sns">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("gallery.badge")}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-heading font-bold text-text-primary tracking-tight"
          >
            {t("gallery.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-text-secondary max-w-lg mx-auto text-sm md:text-base"
          >
            {t("gallery.subtitle")}
          </motion.p>
        </div>

        {/* Category Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2.5 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                "px-5 py-2 text-xs font-semibold rounded-[6px] border transition-all duration-200 cursor-pointer",
                filter === cat.id
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-hover"
              )}
            >
              {getCategoryLabel(cat.id)}
            </button>
          ))}
        </motion.div>

        {/* Filtered Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              item.isVideo ? (
                <GalleryVideoCard
                  key={item.id}
                  item={item}
                  onClick={() => handleOpenLightbox(item)}
                  index={i}
                />
              ) : (
                <GalleryImageCard
                  key={item.id}
                  item={item}
                  onClick={() => handleOpenLightbox(item)}
                  index={i}
                />
              )
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-surface/30 border border-border border-dashed rounded-[8px]"
          >
            <p className="text-text-muted text-sm">{t("gallery.noItems")}</p>
          </motion.div>
        )}

        {/* Featured Video Showcase Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mt-24 border-t border-border/60 pt-20"
        >
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl md:text-3.5xl font-heading font-bold text-text-primary">
              {t("gallery.watchProcess")}
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              {t("gallery.watchSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featuredVideos.map((video, i) => (
              <GalleryVideoCard
                key={`featured-${video.id}`}
                item={video}
                onClick={() => {
                  // Find index in filtered if filtered contains it, or open directly
                  const idx = filtered.findIndex((f) => f.id === video.id);
                  if (idx !== -1) {
                    setLightboxIndex(idx);
                  } else {
                    // Fallback to show from all items
                    const allIdx = galleryItems.findIndex((g) => g.id === video.id);
                    if (allIdx !== -1) {
                      // Temporarily set filter to all/videos to resolve correctly
                      setFilter("all");
                      setTimeout(() => setLightboxIndex(galleryItems.findIndex((g) => g.id === video.id)), 50);
                    }
                  }
                }}
                index={i}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lightbox / Video Player Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-2.5 text-text-secondary hover:text-text-primary bg-surface/60 border border-border hover:border-border-hover rounded-full transition-all cursor-pointer z-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Media Container */}
              <div className="relative rounded-[12px] overflow-hidden bg-black border border-border shadow-2xl mb-4">
                {filtered[lightboxIndex]?.isVideo ? (
                  <div className="aspect-video w-full flex items-center justify-center bg-black">
                    <video
                      key={filtered[lightboxIndex]?.id}
                      src={filtered[lightboxIndex]?.src}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full max-h-[70vh] object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-gradient-to-br from-surface-elevated to-surface flex flex-col items-center justify-center">
                    <Sparkles className="w-14 h-14 text-primary opacity-20 mb-4 animate-pulse" />
                    <p className="text-text-muted text-sm font-medium">
                      {filtered[lightboxIndex]?.title}
                    </p>
                    <p className="text-[11px] text-text-muted/60 mt-1">
                      {t("gallery.comingSoon")}
                    </p>
                  </div>
                )}
              </div>

              {/* Title & Description Overlay Card */}
              <div className="text-center bg-surface/70 backdrop-blur-md p-5 rounded-[12px] border border-border max-w-xl mx-auto">
                <span className="inline-flex px-2 py-0.5 text-[9px] bg-primary/20 text-primary border border-primary/30 rounded-[4px] font-bold uppercase tracking-wider mb-2">
                  {t("gallery." + (filtered[lightboxIndex]?.category === "ceramic-coating" ? "ceramicCoating" : filtered[lightboxIndex]?.category))}
                </span>
                <h3 className="text-base md:text-lg font-semibold text-text-primary">
                  {filtered[lightboxIndex]?.title}
                </h3>
                <p className="text-xs md:text-sm text-text-secondary mt-1 leading-relaxed">
                  {filtered[lightboxIndex]?.description}
                </p>
              </div>

              {/* Navigation Bar */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setLightboxIndex(Math.max(0, lightboxIndex - 1))}
                  disabled={lightboxIndex === 0}
                  className="p-2 rounded-[8px] bg-surface-elevated border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-semibold text-text-muted py-2 bg-surface/40 backdrop-blur-sm border border-border px-3.5 rounded-full">
                  {lightboxIndex + 1} / {filtered.length}
                </span>
                <button
                  onClick={() => setLightboxIndex(Math.min(filtered.length - 1, lightboxIndex + 1))}
                  disabled={lightboxIndex === filtered.length - 1}
                  className="p-2 rounded-[8px] bg-surface-elevated border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
