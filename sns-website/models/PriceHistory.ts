// models/PriceHistory.ts — Tracks every price change for audit trail
import mongoose, { Schema, model, models, type Document, type Types } from "mongoose";

interface VehiclePricing {
  sedan: number;
  suv: number;
  truck: number;
}

export interface IPriceHistory extends Document {
  service: Types.ObjectId;
  previousPricing: VehiclePricing;
  newPricing: VehiclePricing;
  changedBy?: Types.ObjectId; // User who made the change
  reason?: string;
  createdAt: Date;
}

const VehiclePricingSchema = new Schema<VehiclePricing>(
  {
    sedan: { type: Number, required: true, min: 0 },
    suv: { type: Number, required: true, min: 0 },
    truck: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    previousPricing: { type: VehiclePricingSchema, required: true },
    newPricing: { type: VehiclePricingSchema, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, maxlength: 500, trim: true },
  },
  { timestamps: true }
);

PriceHistorySchema.index({ service: 1, createdAt: -1 });

export const PriceHistory =
  (models.PriceHistory as mongoose.Model<IPriceHistory>) ||
  model<IPriceHistory>("PriceHistory", PriceHistorySchema);
