// models/Service.ts — S.N.S service catalog (car wash, detailing, coating, PPF, tinting)
import mongoose, { Schema, model, models, type Document } from "mongoose";

/** Bilingual text field type. */
interface BilingualText {
  en: string;
  ar: string;
}

/** Vehicle-size pricing (Sedan, SUV, Truck/Van). */
interface VehiclePricing {
  sedan: number;
  suv: number;
  truck: number;
}

export type ServiceCategory =
  | "wash"
  | "detailing"
  | "ceramic-coating"
  | "ppf"
  | "tinting";

export interface IService extends Document {
  name: BilingualText;
  description: BilingualText;
  category: ServiceCategory;
  pricing: VehiclePricing;
  duration: number; // in minutes
  images: string[];
  isActive: boolean;
  order: number; // display order within category
  installmentsAllowed: boolean; // primarily for PPF
  maxInstallments: number;
  createdAt: Date;
  updatedAt: Date;
}

const BilingualTextSchema = new Schema<BilingualText>(
  {
    en: { type: String, required: true, maxlength: 500 },
    ar: { type: String, required: true, maxlength: 500 },
  },
  { _id: false }
);

const VehiclePricingSchema = new Schema<VehiclePricing>(
  {
    sedan: { type: Number, required: true, min: 0 },
    suv: { type: Number, required: true, min: 0 },
    truck: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    name: { type: BilingualTextSchema, required: true },
    description: { type: BilingualTextSchema, required: true },
    category: {
      type: String,
      enum: ["wash", "detailing", "ceramic-coating", "ppf", "tinting"],
      required: true,
    },
    pricing: { type: VehiclePricingSchema, required: true },
    duration: { type: Number, required: true, min: 15 }, // minimum 15 minutes
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    installmentsAllowed: { type: Boolean, default: false },
    maxInstallments: { type: Number, default: 1, min: 1, max: 4 },
  },
  { timestamps: true }
);

ServiceSchema.index({ category: 1, order: 1 });
ServiceSchema.index({ isActive: 1 });

export const Service =
  (models.Service as mongoose.Model<IService>) ||
  model<IService>("Service", ServiceSchema);
