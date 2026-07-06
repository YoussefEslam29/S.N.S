// models/Booking.ts — Appointment bookings for S.N.S car care
import mongoose, { Schema, model, models, type Document, type Types } from "mongoose";
import type { VehicleType } from "./Customer";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled";

export type PaymentMethod = "cash" | "digital" | "installments";

interface InstallmentScheduleItem {
  amount: number;
  dueDate: Date;
  paid: boolean;
  paidDate?: Date;
}

interface InstallmentPlan {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  schedule: InstallmentScheduleItem[];
}

export interface IBooking extends Document {
  customer: Types.ObjectId;
  service: Types.ObjectId;
  vehicleType: VehicleType;
  date: Date;
  timeSlot: string; // "14:00", "16:00", etc.
  paymentMethod: PaymentMethod;
  installmentPlan?: InstallmentPlan;
  status: BookingStatus;
  price: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstallmentScheduleItemSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    paid: { type: Boolean, default: false },
    paidDate: { type: Date },
  },
  { _id: false }
);

const InstallmentPlanSchema = new Schema(
  {
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    schedule: [InstallmentScheduleItemSchema],
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "truck"],
      required: true,
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true, maxlength: 10 },
    paymentMethod: {
      type: String,
      enum: ["cash", "digital", "installments"],
      default: "cash",
    },
    installmentPlan: { type: InstallmentPlanSchema },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    price: { type: Number, required: true, min: 0 },
    notes: { type: String, maxlength: 1000, trim: true },
  },
  { timestamps: true }
);

BookingSchema.index({ date: 1, timeSlot: 1 });
BookingSchema.index({ customer: 1, createdAt: -1 });
BookingSchema.index({ status: 1, date: 1 });

export const Booking =
  (models.Booking as mongoose.Model<IBooking>) ||
  model<IBooking>("Booking", BookingSchema);
