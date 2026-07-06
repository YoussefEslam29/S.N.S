"use client";

import { useState } from "react";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

export type VehicleType = "sedan" | "suv" | "truck";

interface VehicleSelectorProps {
  selected: VehicleType;
  onChange: (type: VehicleType) => void;
  size?: "sm" | "md" | "lg";
}

const vehicles: { type: VehicleType; label: string; icon: string }[] = [
  { type: "sedan", label: "Sedan", icon: "🚗" },
  { type: "suv", label: "SUV", icon: "🚙" },
  { type: "truck", label: "Truck / Van", icon: "🚐" },
];

/** Vehicle type selector — updates pricing across the entire page. */
export function VehicleSelector({
  selected,
  onChange,
  size = "md",
}: VehicleSelectorProps) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Select vehicle type">
      {vehicles.map((v) => (
        <button
          key={v.type}
          onClick={() => onChange(v.type)}
          role="radio"
          aria-checked={selected === v.type}
          className={cn(
            "relative flex items-center gap-2 rounded-[4px] font-medium transition-all duration-200",
            size === "sm" && "px-3 py-1.5 text-xs",
            size === "md" && "px-4 py-2.5 text-sm",
            size === "lg" && "px-6 py-3.5 text-base",
            selected === v.type
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border"
          )}
        >
          <span className="text-lg" aria-hidden="true">{v.icon}</span>
          <span>{v.label}</span>
          {selected === v.type && (
            <span className="absolute inset-0 rounded-[4px] ring-2 ring-primary/30 animate-pulse-glow" />
          )}
        </button>
      ))}
    </div>
  );
}
