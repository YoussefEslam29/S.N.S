"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Star,
  StarOff,
  X,
  Save,
  Image as ImageIcon,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingOverlay } from "@/components/LoadingOverlay";

interface GalleryAdminItem {
  _id: string;
  title: { en: string; ar: string };
  beforeImage: string;
  afterImage: string;
  service?: { _id: string; name: { en: string }; category: string } | null;
  vehicleType: string;
  isFeatured: boolean;
}

const categoryLabels: Record<string, string> = {
  wash: "Car Wash",
  detailing: "Detailing",
  "ceramic-coating": "Ceramic Coating",
  ppf: "PPF",
  tinting: "Tinting",
};

const categoryColors: Record<string, string> = {
  wash: "bg-blue-500/10 text-blue-400",
  detailing: "bg-purple-500/10 text-purple-400",
  "ceramic-coating": "bg-emerald-500/10 text-emerald-400",
  ppf: "bg-amber-500/10 text-amber-400",
  tinting: "bg-cyan-500/10 text-cyan-400",
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryAdminItem[]>([]);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    beforeImage: "",
    afterImage: "",
    category: "wash",
    vehicleType: "sedan",
    isFeatured: false,
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch gallery items");
      const data = await res.json();
      setItems(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered = items.filter((item) =>
    item.title.en.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFeatured = async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !item.isFeatured }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to toggle featured");
      }
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, isFeatured: !i.isFeatured } : i))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this gallery item?")) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete item");
      }
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.titleEn || !formData.beforeImage || !formData.afterImage) return;
    try {
      setSaving(true);
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: { en: formData.titleEn, ar: formData.titleAr },
          beforeImage: formData.beforeImage,
          afterImage: formData.afterImage,
          vehicleType: formData.vehicleType,
          isFeatured: formData.isFeatured,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add gallery item");
      }
      setFormData({
        titleEn: "",
        titleAr: "",
        beforeImage: "",
        afterImage: "",
        category: "wash",
        vehicleType: "sedan",
        isFeatured: false,
      });
      setIsAdding(false);
      await fetchItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
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
      <LoadingOverlay show={saving} message="Saving gallery details..." />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Gallery
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage before/after photos. Featured items appear on the homepage.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gallery items..."
          className="w-full h-9 pl-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary outline-none transition-colors"
        />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const category = item.service?.category || "";
          return (
            <div
              key={item._id}
              className="rounded-[4px] border border-border bg-surface overflow-hidden"
            >
              {/* Image placeholders */}
              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="aspect-[4/3] bg-surface-elevated flex items-center justify-center">
                  {item.beforeImage ? (
                    <img
                      src={item.beforeImage}
                      alt="Before"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={cn("text-center", item.beforeImage && "hidden")}>
                    <ImageIcon className="w-6 h-6 text-text-muted mx-auto mb-1" />
                    <span className="text-[10px] text-text-muted">Before</span>
                  </div>
                </div>
                <div className="aspect-[4/3] bg-surface-elevated flex items-center justify-center">
                  {item.afterImage ? (
                    <img
                      src={item.afterImage}
                      alt="After"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={cn("text-center", item.afterImage && "hidden")}>
                    <ImageIcon className="w-6 h-6 text-text-muted mx-auto mb-1" />
                    <span className="text-[10px] text-text-muted">After</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">
                    {item.title.en}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5 font-arabic" dir="rtl">
                    {item.title.ar}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {category && (
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-[4px] ${
                        categoryColors[category] || "bg-surface-elevated text-text-muted"
                      }`}
                    >
                      {categoryLabels[category] || category}
                    </span>
                  )}
                  <span className="text-[10px] text-text-muted uppercase">
                    {item.vehicleType}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <button
                    onClick={() => toggleFeatured(item._id)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium transition-colors",
                      item.isFeatured
                        ? "text-amber-400 hover:text-amber-300"
                        : "text-text-muted hover:text-amber-400"
                    )}
                  >
                    {item.isFeatured ? (
                      <Star className="w-4 h-4 fill-amber-400" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                    {item.isFeatured ? "Featured" : "Feature"}
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="p-1.5 rounded-[4px] text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="py-12 text-center text-text-muted text-sm">
          No gallery items found.
        </div>
      )}

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[4px] border border-border bg-surface p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-text-primary">
                Add Gallery Item
              </h2>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Title (EN)
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) =>
                    setFormData({ ...formData, titleEn: e.target.value })
                  }
                  placeholder="e.g. BMW X5 — Full PPF Wrap"
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Title (AR)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.titleAr}
                  onChange={(e) =>
                    setFormData({ ...formData, titleAr: e.target.value })
                  }
                  placeholder="العنوان بالعربي"
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Before Image URL
                </label>
                <input
                  type="text"
                  value={formData.beforeImage}
                  onChange={(e) =>
                    setFormData({ ...formData, beforeImage: e.target.value })
                  }
                  placeholder="/gallery/before-1.jpg"
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  After Image URL
                </label>
                <input
                  type="text"
                  value={formData.afterImage}
                  onChange={(e) =>
                    setFormData({ ...formData, afterImage: e.target.value })
                  }
                  placeholder="/gallery/after-1.jpg"
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleType: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                >
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck / Van</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-xs text-text-secondary">
                    Featured on homepage
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="h-9 px-4 border border-border text-text-secondary hover:text-text-primary rounded-[4px] text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
