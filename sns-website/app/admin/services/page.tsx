"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
  Clock,
  Search,
  Loader2,
  AlertCircle,
  TrendingUp,
  History,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { LoadingOverlay } from "@/components/LoadingOverlay";

type ServiceCategory = "wash" | "detailing" | "ceramic-coating" | "ppf" | "tinting";

interface ServiceItem {
  _id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  category: ServiceCategory;
  pricing: { sedan: number; suv: number; truck: number };
  duration: number;
  isActive: boolean;
  installmentsAllowed: boolean;
  maxInstallments: number;
  order: number;
}

interface PriceHistoryItem {
  _id: string;
  previousPricing: { sedan: number; suv: number; truck: number };
  newPricing: { sedan: number; suv: number; truck: number };
  reason?: string;
  createdAt: string;
}

const categoryLabels: Record<ServiceCategory, string> = {
  wash: "Car Wash",
  detailing: "Detailing",
  "ceramic-coating": "Ceramic Coating",
  ppf: "PPF",
  tinting: "Tinting",
};

const categoryColors: Record<ServiceCategory, string> = {
  wash: "bg-blue-500/10 text-blue-400",
  detailing: "bg-purple-500/10 text-purple-400",
  "ceramic-coating": "bg-emerald-500/10 text-emerald-400",
  ppf: "bg-amber-500/10 text-amber-400",
  tinting: "bg-cyan-500/10 text-cyan-400",
};

const emptyForm = {
  nameEn: "",
  nameAr: "",
  descEn: "",
  descAr: "",
  category: "wash" as ServiceCategory,
  pricingSedan: 0,
  pricingSuv: 0,
  pricingTruck: 0,
  duration: 60,
  isActive: true,
  installmentsAllowed: false,
  maxInstallments: 1,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | ServiceCategory>("all");
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bulk price update state
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<ServiceCategory | "all">("all");
  const [bulkPercentage, setBulkPercentage] = useState(0);
  const [bulkSaving, setBulkSaving] = useState(false);

  // Price history state
  const [priceHistoryServiceId, setPriceHistoryServiceId] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
  const [priceHistoryLoading, setPriceHistoryLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services?all=true");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filtered = services.filter((s) => {
    const matchSearch = s.name.en.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || s.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const openCreate = () => {
    setFormData(emptyForm);
    setEditingService(null);
    setIsCreating(true);
  };

  const openEdit = (s: ServiceItem) => {
    setFormData({
      nameEn: s.name.en,
      nameAr: s.name.ar,
      descEn: s.description.en,
      descAr: s.description.ar,
      category: s.category,
      pricingSedan: s.pricing.sedan,
      pricingSuv: s.pricing.suv,
      pricingTruck: s.pricing.truck,
      duration: s.duration,
      isActive: s.isActive,
      installmentsAllowed: s.installmentsAllowed,
      maxInstallments: s.maxInstallments,
    });
    setEditingService(s);
    setIsCreating(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const body = {
        name: { en: formData.nameEn, ar: formData.nameAr },
        description: { en: formData.descEn, ar: formData.descAr },
        category: formData.category,
        pricing: {
          sedan: formData.pricingSedan,
          suv: formData.pricingSuv,
          truck: formData.pricingTruck,
        },
        duration: formData.duration,
        isActive: formData.isActive,
        installmentsAllowed: formData.installmentsAllowed,
        maxInstallments: formData.maxInstallments,
      };

      if (editingService) {
        const res = await fetch(`/api/services/${editingService._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update service");
        }
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create service");
        }
      }

      setIsCreating(false);
      setEditingService(null);
      await fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service: ServiceItem) => {
    try {
      const res = await fetch(`/api/services/${service._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Toggle failed");
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete service");
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkPercentage === 0) return;
    if (!confirm(`Apply ${bulkPercentage > 0 ? "+" : ""}${bulkPercentage}% to ${bulkCategory === "all" ? "all" : categoryLabels[bulkCategory]} services?`)) return;
    try {
      setBulkSaving(true);
      const body: Record<string, unknown> = { percentage: bulkPercentage };
      if (bulkCategory !== "all") body.category = bulkCategory;
      const res = await fetch("/api/services/bulk-price", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Bulk update failed");
      }
      setShowBulkUpdate(false);
      setBulkPercentage(0);
      await fetchServices();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bulk update failed");
    } finally {
      setBulkSaving(false);
    }
  };

  const fetchPriceHistory = async (serviceId: string) => {
    if (priceHistoryServiceId === serviceId) {
      setPriceHistoryServiceId(null);
      return;
    }
    try {
      setPriceHistoryLoading(true);
      setPriceHistoryServiceId(serviceId);
      const res = await fetch(`/api/services/${serviceId}/price-history`);
      if (!res.ok) throw new Error("Failed to fetch price history");
      const data = await res.json();
      setPriceHistory(data.data ?? []);
    } catch {
      setPriceHistory([]);
    } finally {
      setPriceHistoryLoading(false);
    }
  };

  const moveOrder = async (service: ServiceItem, direction: "up" | "down") => {
    const sameCategory = services
      .filter((s) => s.category === service.category)
      .sort((a, b) => a.order - b.order);
    const idx = sameCategory.findIndex((s) => s._id === service._id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sameCategory.length) return;

    const target = sameCategory[swapIdx];
    try {
      await Promise.all([
        fetch(`/api/services/${service._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: target.order }),
        }),
        fetch(`/api/services/${target._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: service.order }),
        }),
      ]);
      await fetchServices();
    } catch {
      alert("Failed to reorder");
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
      <LoadingOverlay show={saving || bulkSaving} message="Saving service details..." />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Services
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your service catalog and pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkUpdate(true)}
            className="flex items-center gap-2 h-9 px-4 border border-border text-text-secondary hover:text-primary hover:border-primary/30 text-sm font-medium rounded-[4px] transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Bulk Update Prices
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full h-9 pl-10 pr-4 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm placeholder:text-text-muted focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(["all", ...Object.keys(categoryLabels)] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat as typeof filterCategory)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-[4px] whitespace-nowrap transition-colors",
                filterCategory === cat
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary"
              )}
            >
              {cat === "all" ? "All" : categoryLabels[cat as ServiceCategory]}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-[4px] border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Service</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Sedan</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">SUV</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Truck</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Duration</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((service) => (
                <>
                  <tr key={service._id} className="hover:bg-surface-elevated/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{service.name.en}</p>
                      <p className="text-xs text-text-muted mt-0.5 font-arabic" dir="rtl">{service.name.ar}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-medium rounded-[4px] ${categoryColors[service.category]}`}>
                        {categoryLabels[service.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary font-medium">{formatPrice(service.pricing.sedan)}</td>
                    <td className="px-4 py-3 text-right text-text-primary font-medium">{formatPrice(service.pricing.suv)}</td>
                    <td className="px-4 py-3 text-right text-text-primary font-medium">{formatPrice(service.pricing.truck)}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(service.duration / 60)}h{service.duration % 60 > 0 ? ` ${service.duration % 60}m` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(service)}
                        className="inline-flex items-center gap-1 text-xs"
                        aria-label={service.isActive ? "Deactivate" : "Activate"}
                      >
                        {service.isActive ? (
                          <><ToggleRight className="w-5 h-5 text-success" /><span className="text-success">Active</span></>
                        ) : (
                          <><ToggleLeft className="w-5 h-5 text-text-muted" /><span className="text-text-muted">Inactive</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => moveOrder(service, "up")}
                          className="p-1.5 rounded-[4px] text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveOrder(service, "down")}
                          className="p-1.5 rounded-[4px] text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => fetchPriceHistory(service._id)}
                          className="p-1.5 rounded-[4px] text-text-muted hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                          aria-label="Price history"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(service)}
                          className="p-1.5 rounded-[4px] text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service._id)}
                          className="p-1.5 rounded-[4px] text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Price History Expandable Row */}
                  {priceHistoryServiceId === service._id && (
                    <tr key={`${service._id}-history`}>
                      <td colSpan={8} className="px-4 py-3 bg-surface-elevated/30">
                        {priceHistoryLoading ? (
                          <div className="flex items-center gap-2 text-text-muted text-sm py-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading price history...
                          </div>
                        ) : priceHistory.length === 0 ? (
                          <p className="text-sm text-text-muted py-2">No price changes recorded yet.</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                              Price Change History
                            </p>
                            {priceHistory.map((entry) => (
                              <div key={entry._id} className="flex flex-wrap items-center gap-4 py-2 border-b border-border last:border-0 text-sm">
                                <span className="text-xs text-text-muted min-w-[120px]">
                                  {new Date(entry.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-error line-through text-xs">
                                    S:{formatPrice(entry.previousPricing.sedan)}
                                  </span>
                                  <span className="text-success text-xs">
                                    S:{formatPrice(entry.newPricing.sedan)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-error line-through text-xs">
                                    SUV:{formatPrice(entry.previousPricing.suv)}
                                  </span>
                                  <span className="text-success text-xs">
                                    SUV:{formatPrice(entry.newPricing.suv)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-error line-through text-xs">
                                    T:{formatPrice(entry.previousPricing.truck)}
                                  </span>
                                  <span className="text-success text-xs">
                                    T:{formatPrice(entry.newPricing.truck)}
                                  </span>
                                </div>
                                {entry.reason && (
                                  <span className="text-xs text-text-muted italic">{entry.reason}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">
            No services found.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[4px] border border-border bg-surface p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-text-primary">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>
              <button onClick={() => setIsCreating(false)} className="p-1 text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Name (EN)</label>
                <input type="text" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Name (AR)</label>
                <input type="text" dir="rtl" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Description (EN)</label>
                <textarea value={formData.descEn} onChange={(e) => setFormData({ ...formData, descEn: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-text-secondary mb-1">Description (AR)</label>
                <textarea dir="rtl" value={formData.descAr} onChange={(e) => setFormData({ ...formData, descAr: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })} className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none">
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Duration (min)</label>
                <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} min={15} className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Sedan Price (EGP)</label>
                <input type="number" value={formData.pricingSedan} onChange={(e) => setFormData({ ...formData, pricingSedan: Number(e.target.value) })} min={0} className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">SUV Price (EGP)</label>
                <input type="number" value={formData.pricingSuv} onChange={(e) => setFormData({ ...formData, pricingSuv: Number(e.target.value) })} min={0} className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Truck Price (EGP)</label>
                <input type="number" value={formData.pricingTruck} onChange={(e) => setFormData({ ...formData, pricingTruck: Number(e.target.value) })} min={0} className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.installmentsAllowed} onChange={(e) => setFormData({ ...formData, installmentsAllowed: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <span className="text-xs text-text-secondary">Allow Installments</span>
                </label>
                {formData.installmentsAllowed && (
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Max Installments (1-4)</label>
                    <input type="number" value={formData.maxInstallments} onChange={(e) => setFormData({ ...formData, maxInstallments: Math.min(4, Math.max(1, Number(e.target.value))) })} min={1} max={4} className="w-24 h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none" />
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsCreating(false)} className="h-9 px-4 border border-border text-text-secondary hover:text-text-primary rounded-[4px] text-sm transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingService ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Price Update Modal */}
      {showBulkUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[4px] border border-border bg-surface p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-text-primary">
                Bulk Price Update
              </h2>
              <button onClick={() => setShowBulkUpdate(false)} className="p-1 text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value as typeof bulkCategory)}
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Percentage Change ({bulkPercentage > 0 ? "+" : ""}{bulkPercentage}%)
                </label>
                <input
                  type="number"
                  value={bulkPercentage}
                  onChange={(e) => setBulkPercentage(Math.min(100, Math.max(-50, Number(e.target.value))))}
                  min={-50}
                  max={100}
                  className="w-full h-9 px-3 rounded-[4px] border border-border bg-surface-elevated text-text-primary text-sm focus:border-primary outline-none"
                />
                <p className="text-xs text-text-muted mt-1">Range: -50% to +100%</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowBulkUpdate(false)} className="h-9 px-4 border border-border text-text-secondary hover:text-text-primary rounded-[4px] text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={bulkSaving || bulkPercentage === 0}
                className="flex items-center gap-2 h-9 px-4 bg-warning hover:bg-warning/90 text-background text-sm font-medium rounded-[4px] transition-colors disabled:opacity-50"
              >
                {bulkSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Apply Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
