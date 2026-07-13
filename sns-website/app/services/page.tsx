"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Droplets,
  Sparkles,
  Shield,
  Film,
  Sun,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { VehicleSelector, type VehicleType } from "@/components/services/VehicleSelector";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

type ServiceCategory = "all" | "wash" | "detailing" | "ceramic-coating" | "ppf" | "tinting";

const categoryTabs: { id: ServiceCategory; label: string; icon: typeof Droplets }[] = [
  { id: "all", label: "All Services", icon: Sparkles },
  { id: "wash", label: "Car Wash", icon: Droplets },
  { id: "detailing", label: "Detailing", icon: Sparkles },
  { id: "ceramic-coating", label: "Ceramic Coating", icon: Shield },
  { id: "ppf", label: "PPF", icon: Film },
  { id: "tinting", label: "Tinting", icon: Sun },
];

const categoryIcons: Record<string, typeof Droplets> = {
  wash: Droplets,
  detailing: Sparkles,
  "ceramic-coating": Shield,
  ppf: Film,
  tinting: Sun,
};

interface ApiService {
  _id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  category: string;
  pricing: { sedan: number; suv: number; truck: number };
  duration: number;
  installmentsAllowed: boolean;
  maxInstallments: number;
}

export default function ServicesPage() {
  const { locale, t } = useLanguage();
  const [vehicleType, setVehicleType] = useState<VehicleType>("sedan");
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("all");
  const [services, setServices] = useState<ApiService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setServices(data.data ?? []);
      } catch {
        // Fallback: empty state
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <div className="py-12 md:py-20">
      <div className="container-sns">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            Our Services
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto mb-8">
            From a quick wash to full paint protection — everything your car needs,
            with transparent pricing for your vehicle.
          </p>

          {/* Vehicle Selector */}
          <div className="flex justify-center mb-8">
            <VehicleSelector
              selected={vehicleType}
              onChange={setVehicleType}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[4px] transition-all duration-200",
                  activeCategory === tab.id
                    ? "bg-primary text-white"
                    : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.id === "all" ? t("gallery.allWork") : 
                 tab.id === "wash" ? t("gallery.carWash") : 
                 tab.id === "detailing" ? t("gallery.detailing") : 
                 tab.id === "ceramic-coating" ? t("gallery.ceramicCoating") : 
                 tab.id === "ppf" ? t("gallery.ppf") : 
                 tab.id === "tinting" ? t("gallery.tinting") : tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {/* Services Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, i) => {
              const Icon = categoryIcons[service.category] || Sparkles;
              const price = service.pricing[vehicleType];
              const hours = Math.floor(service.duration / 60);
              const mins = service.duration % 60;
              const durationStr = hours > 0
                ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
                : `${mins}m`;

              return (
                <div
                  key={service._id}
                  className="group flex flex-col rounded-[4px] border border-border bg-surface hover:border-primary/30 transition-all duration-300 animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="p-6 flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 flex items-center justify-center rounded-[4px] bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        {durationStr}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {locale === "ar" ? service.name.ar : service.name.en}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {locale === "ar" ? service.description.ar : service.description.en}
                      </p>
                    </div>

                    {/* Badges */}
                    {service.installmentsAllowed && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-amber-500/10 text-amber-400 rounded-[4px] border border-amber-500/20">
                        {locale === "ar" 
                          ? `تقسيط متاح (${service.maxInstallments} دفعات)` 
                          : `Installments Available (${service.maxInstallments} payments)`}
                      </span>
                    )}
                  </div>

                  {/* Footer with price & CTA */}
                  <div className="p-6 pt-0 mt-auto">
                    <div className="flex items-end justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-text-muted uppercase tracking-wider">
                          Price ({vehicleType})
                        </p>
                        <p className="text-xl font-heading font-bold text-primary">
                          {formatPrice(price)}
                        </p>
                      </div>
                      <Link
                        href={`/booking?service=${service._id}&vehicle=${vehicleType}`}
                        className="inline-flex items-center gap-1 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors"
                      >
                        {locale === "ar" ? "احجز" : "Book"}
                        <ArrowRight className={cn("w-4 h-4", locale === "ar" && "rotate-180")} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="py-12 text-center text-text-muted text-sm">
            No services available in this category.
          </div>
        )}
      </div>
    </div>
  );
}
