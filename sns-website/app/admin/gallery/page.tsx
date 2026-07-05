"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Star,
  StarOff,
  X,
  Save,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryAdminItem {
  id: string;
  titleEn: string;
  titleAr: string;
  beforeImage: string;
  afterImage: string;
  category: string;
  vehicleType: string;
  isFeatured: boolean;
}

/* ─── Placeholder data ─── */
const initialItems: GalleryAdminItem[] = [
  { id: "1", titleEn: "BMW X5 — Full PPF Wrap", titleAr: "BMW X5 — تغليف PPF كامل", beforeImage: "/gallery/before-1.jpg", afterImage: "/gallery/after-1.jpg", category: "ppf", vehicleType: "suv", isFeatured: true },
  { id: "2", titleEn: "Mercedes C-Class — Ceramic Coating", titleAr: "مرسيدس C — طلاء سيراميك", beforeImage: "/gallery/before-2.jpg", afterImage: "/gallery/after-2.jpg", category: "ceramic-coating", vehicleType: "sedan", isFeatured: true },
  { id: "3", titleEn: "Toyota Land Cruiser — Interior Detail", titleAr: "تويوتا لاند كروزر — تفصيل داخلي", beforeImage: "/gallery/before-3.jpg", afterImage: "/gallery/after-3.jpg", category: "detailing", vehicleType: "truck", isFeatured: false },
  { id: "4", titleEn: "Hyundai Tucson — Window Tinting", titleAr: "هيونداي توسان — تظليل", beforeImage: "/gallery/before-4.jpg", afterImage: "/gallery/after-4.jpg", category: "tinting", vehicleType: "suv", isFeatured: false },
  { id: "5", titleEn: "Kia Cerato — Premium Wash", titleAr: "كيا سيراتو — غسيل بريميوم", beforeImage: "/gallery/before-5.jpg", afterImage: "/gallery/after-5.jpg", category: "wash", vehicleType: "sedan", isFeatured: true },
];

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
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    beforeImage: "",
    afterImage: "",
    category: "wash",
    vehicleType: "sedan",
    isFeatured: false,
  });

  const filtered = items.filter((item) =>
    item.titleEn.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFeatured = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFeatured: !item.isFeatured } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = () => {
    if (!formData.titleEn || !formData.beforeImage || !formData.afterImage) return;
    setItems((prev) => [
      { id: Date.now().toString(), ...formData },
      ...prev,
    ]);
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
  };

  return (
    <div className="space-y-6">
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
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-[4px] border border-border bg-surface overflow-hidden"
          >
            {/* Image placeholders */}
            <div className="grid grid-cols-2 gap-px bg-border">
              <div className="aspect-[4/3] bg-surface-elevated flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-6 h-6 text-text-muted mx-auto mb-1" />
                  <span className="text-[10px] text-text-muted">Before</span>
                </div>
              </div>
              <div className="aspect-[4/3] bg-surface-elevated flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-6 h-6 text-text-muted mx-auto mb-1" />
                  <span className="text-[10px] text-text-muted">After</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  {item.titleEn}
                </h3>
                <p className="text-xs text-text-muted mt-0.5 font-arabic" dir="rtl">
                  {item.titleAr}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-[4px] ${
                    categoryColors[item.category] || "bg-surface-elevated text-text-muted"
                  }`}
                >
                  {categoryLabels[item.category] || item.category}
                </span>
                <span className="text-[10px] text-text-muted uppercase">
                  {item.vehicleType}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <button
                  onClick={() => toggleFeatured(item.id)}
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
                  onClick={() => deleteItem(item.id)}
                  className="p-1.5 rounded-[4px] text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
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
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                >
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
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
                className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors"
              >
                <Save className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
