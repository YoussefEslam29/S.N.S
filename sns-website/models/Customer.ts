// models/Customer.ts — Customer records for S.N.S bookings
import mongoose, { Schema, model, models, type Document } from "mongoose";

export type VehicleType = "sedan" | "suv" | "truck";

export interface ICustomer extends Document {
  name: string;
  phone: string; // primary identifier in Egypt
  email?: string;
  vehicleType: VehicleType;
  vehicleMake?: string;
  vehicleModel?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, maxlength: 200, trim: true },
    phone: { type: String, required: true, maxlength: 20, trim: true },
    email: { type: String, maxlength: 200, trim: true, lowercase: true },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "truck"],
      required: true,
    },
    vehicleMake: { type: String, maxlength: 100, trim: true },
    vehicleModel: { type: String, maxlength: 100, trim: true },
    notes: { type: String, maxlength: 1000, trim: true },
  },
  { timestamps: true }
);

CustomerSchema.index({ phone: 1 }, { unique: true });
CustomerSchema.index({ name: "text", phone: "text" });

export const Customer =
  (models.Customer as mongoose.Model<ICustomer>) ||
  model<ICustomer>("Customer", CustomerSchema);
