// models/TimeSlot.ts — Time slot management for booking capacity
import mongoose, { Schema, model, models, type Document, type Types } from "mongoose";

export interface ITimeSlot extends Document {
  date: Date;
  time: string; // "14:00", "15:00", etc.
  capacity: number; // max simultaneous bookings
  currentBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true, maxlength: 10 },
    capacity: { type: Number, default: 3, min: 1 },
    currentBookings: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

TimeSlotSchema.index({ date: 1, time: 1 }, { unique: true });

export const TimeSlot =
  (models.TimeSlot as mongoose.Model<ITimeSlot>) ||
  model<ITimeSlot>("TimeSlot", TimeSlotSchema);
