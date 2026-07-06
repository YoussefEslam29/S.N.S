"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Droplets,
  Sparkles,
  Shield,
  Film,
  Sun,
  Clock,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { VehicleSelector, type VehicleType } from "@/components/services/VehicleSelector";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ServiceCategory = "all" | "wash" | "detailing" | "ceramic-coating" | "ppf" | "tinting";

const categoryTabs: { id: ServiceCategory; label: string; icon: typeof Droplets }[] = [
  { id: "all", label: "All Services", icon: Sparkles },
  { id: "wash", label: "Car Wash", icon: Droplets },
  { id: "detailing", label: "Detailing", icon: Sparkles },
  { id: "ceramic-coating", label: "Ceramic Coating", icon: Shield },
  { id: "ppf", label: "PPF", icon: Film },
  { id: "tinting", label: "Tinting", icon: Sun },
];

/* ─── Full service list with pricing ─── */
const services = [
  // Car Wash
  {
    id: "wash-basic",
    category: "wash" as const,
    name: "Inside & Outside Wash",
    description: "Complete interior vacuuming and exterior hand wash. The essential clean for your car.",
    pricing: { sedan: 300, suv: 400, truck: 500 },
    duration: 60,
    icon: Droplets,
  },
  {
    id: "wash-detailed",
    category: "wash" as const,
    name: "Wash + Chemical Wiping",
    description: "Full wash plus detailed interior chemical wiping for a deeper clean. Includes dashboard, door panels, and seat care.",
    pricing: { sedan: 400, suv: 550, truck: 700 },
    duration: 90,
    icon: Droplets,
  },
  {
    id: "wash-premium",
    category: "wash" as const,
    name: "Premium Wash + Motor Cleaning",
    description: "Everything in the chemical wash, plus professional motor bay cleaning with specialized chemicals.",
    pricing: { sedan: 500, suv: 700, truck: 900 },
    duration: 120,
    icon: Droplets,
  },
  // Detailing
  {
    id: "detail-interior",
    category: "detailing" as const,
    name: "Full Interior Detailing",
    description: "Deep steam cleaning, leather conditioning, carpet extraction, and full interior restoration.",
    pricing: { sedan: 800, suv: 1100, truck: 1400 },
    duration: 180,
    icon: Sparkles,
  },
  {
    id: "detail-exterior",
    category: "detailing" as const,
    name: "Exterior Polish & Detail",
    description: "Paint correction, clay bar treatment, machine polishing, and sealant application for a mirror finish.",
    pricing: { sedan: 1200, suv: 1600, truck: 2000 },
    duration: 240,
    icon: Sparkles,
  },
  // Ceramic Coating
  {
    id: "ceramic-standard",
    category: "ceramic-coating" as const,
    name: "Ceramic Coating — Standard",
    description: "Single-layer ceramic coating for up to 2 years of hydrophobic protection and UV resistance.",
    pricing: { sedan: 3000, suv: 4000, truck: 5000 },
    duration: 480,
    icon: Shield,
  },
  {
    id: "ceramic-premium",
    category: "ceramic-coating" as const,
    name: "Ceramic Coating — Premium",
    description: "Multi-layer ceramic coating for 3-5 years of protection. Includes paint correction prep.",
    pricing: { sedan: 5000, suv: 7000, truck: 9000 },
    duration: 720,
    icon: Shield,
  },
  // PPF
  {
    id: "ppf-partial",
    category: "ppf" as const,
    name: "PPF — Front End Package",
    description: "Paint protection film on hood, front bumper, fenders, and mirrors. Protects against road chips.",
    pricing: { sedan: 15000, suv: 20000, truck: 25000 },
    duration: 1440,
    icon: Film,
    installmentsAllowed: true,
  },
  {
    id: "ppf-full",
    category: "ppf" as const,
    name: "PPF — Full Body Wrap",
    description: "Complete paint protection film coverage. The ultimate defense for your entire vehicle.",
    pricing: { sedan: 35000, suv: 45000, truck: 55000 },
    duration: 2880,
    icon: Film,
    installmentsAllowed: true,
  },
  // Tinting
  {
    id: "tint-standard",
    category: "tinting" as const,
    name: "Window Tinting — Standard",
    description: "Quality window film with UV protection and heat rejection. Choose your darkness level.",
    pricing: { sedan: 1500, suv: 2000, truck: 2500 },
    duration: 120,
    icon: Sun,
  },
  {
    id: "tint-ceramic",
    category: "tinting" as const,
    name: "Window Tinting — Ceramic",
    description: "Premium ceramic window film for maximum heat rejection without reducing visibility.",
    pricing: { sedan: 3000, suv: 4000, truck: 5000 },
    duration: 180,
    icon: Sun,
  },
];

export default function ServicesPage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("sedan");
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("all");

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
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, i) => {
            const Icon = service.icon;
            const price = service.pricing[vehicleType];
            const hours = Math.floor(service.duration / 60);
            const mins = service.duration % 60;
            const durationStr = hours > 0
              ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
              : `${mins}m`;

            return (
              <div
                key={service.id}
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
                      {service.name}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Badges */}
                  {"installmentsAllowed" in service && service.installmentsAllowed && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-amber-500/10 text-amber-400 rounded-[4px] border border-amber-500/20">
                      Installments Available (3 payments)
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
                      href={`/booking?service=${service.id}&vehicle=${vehicleType}`}
                      className="inline-flex items-center gap-1 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[4px] transition-colors"
                    >
                      Book
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
