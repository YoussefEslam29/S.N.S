"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

type ServiceCategory = "wash" | "detailing" | "ceramic-coating" | "ppf" | "tinting";

interface ServiceItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  category: ServiceCategory;
  pricingSedan: number;
  pricingSuv: number;
  pricingTruck: number;
  duration: number;
  isActive: boolean;
  installmentsAllowed: boolean;
  maxInstallments: number;
}

/* ─── Placeholder data (until connected to API) ─── */
const initialServices: ServiceItem[] = [
  { id: "1", nameEn: "Inside & Outside Wash", nameAr: "غسيل داخلي وخارجي", descEn: "Complete interior and exterior wash", descAr: "غسيل شامل", category: "wash", pricingSedan: 300, pricingSuv: 400, pricingTruck: 500, duration: 60, isActive: true, installmentsAllowed: false, maxInstallments: 1 },
  { id: "2", nameEn: "Wash + Chemical Wiping", nameAr: "غسيل + مسح كيميائي", descEn: "Full wash with chemical wiping", descAr: "غسيل مع تنظيف كيميائي", category: "wash", pricingSedan: 400, pricingSuv: 550, pricingTruck: 700, duration: 90, isActive: true, installmentsAllowed: false, maxInstallments: 1 },
  { id: "3", nameEn: "Ceramic Coating — Standard", nameAr: "طلاء سيراميك عادي", descEn: "Single-layer ceramic coating", descAr: "طبقة واحدة سيراميك", category: "ceramic-coating", pricingSedan: 3000, pricingSuv: 4000, pricingTruck: 5000, duration: 480, isActive: true, installmentsAllowed: false, maxInstallments: 1 },
  { id: "4", nameEn: "PPF — Front End Package", nameAr: "PPF — الأمامي", descEn: "Hood, bumper, fenders, mirrors", descAr: "كبوت وصدام ومرايات", category: "ppf", pricingSedan: 15000, pricingSuv: 20000, pricingTruck: 25000, duration: 1440, isActive: true, installmentsAllowed: true, maxInstallments: 3 },
  { id: "5", nameEn: "Window Tinting — Standard", nameAr: "تظليل عادي", descEn: "Quality window film with UV protection", descAr: "فيلم تظليل مع حماية UV", category: "tinting", pricingSedan: 1500, pricingSuv: 2000, pricingTruck: 2500, duration: 120, isActive: true, installmentsAllowed: false, maxInstallments: 1 },
];

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
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | ServiceCategory>("all");
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const filtered = services.filter((s) => {
    const matchSearch = s.nameEn.toLowerCase().includes(search.toLowerCase());
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
      nameEn: s.nameEn,
      nameAr: s.nameAr,
      descEn: s.descEn,
      descAr: s.descAr,
      category: s.category,
      pricingSedan: s.pricingSedan,
      pricingSuv: s.pricingSuv,
      pricingTruck: s.pricingTruck,
      duration: s.duration,
      isActive: s.isActive,
      installmentsAllowed: s.installmentsAllowed,
      maxInstallments: s.maxInstallments,
    });
    setEditingService(s);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id ? { ...s, ...formData } : s
        )
      );
    } else {
      setServices((prev) => [
        ...prev,
        { id: Date.now().toString(), ...formData },
      ]);
    }
    setIsCreating(false);
    setEditingService(null);
  };

  const toggleActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
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
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
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
                <tr key={service.id} className="hover:bg-surface-elevated/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{service.nameEn}</p>
                    <p className="text-xs text-text-muted mt-0.5 font-arabic" dir="rtl">{service.nameAr}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-medium rounded-[4px] ${categoryColors[service.category]}`}>
                      {categoryLabels[service.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-text-primary font-medium">{formatPrice(service.pricingSedan)}</td>
                  <td className="px-4 py-3 text-right text-text-primary font-medium">{formatPrice(service.pricingSuv)}</td>
                  <td className="px-4 py-3 text-right text-text-primary font-medium">{formatPrice(service.pricingTruck)}</td>
                  <td className="px-4 py-3 text-center text-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(service.duration / 60)}h{service.duration % 60 > 0 ? ` ${service.duration % 60}m` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(service.id)}
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
                        onClick={() => openEdit(service)}
                        className="p-1.5 rounded-[4px] text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="p-1.5 rounded-[4px] text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
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
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.installmentsAllowed} onChange={(e) => setFormData({ ...formData, installmentsAllowed: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <span className="text-xs text-text-secondary">Installments</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsCreating(false)} className="h-9 px-4 border border-border text-text-secondary hover:text-text-primary rounded-[4px] text-sm transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors">
                <Save className="w-4 h-4" />
                {editingService ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
