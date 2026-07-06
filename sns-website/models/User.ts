// models/User.ts — Staff accounts for admin dashboard (admin, receptionist, technician)
import mongoose, { Schema, model, models, type Document } from "mongoose";

export type UserRole = "admin" | "receptionist" | "technician";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // bcrypt hashed — never return in API responses
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, maxlength: 200, trim: true },
    email: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "receptionist", "technician"],
      default: "receptionist",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, isActive: 1 });

export const User =
  (models.User as mongoose.Model<IUser>) ||
  model<IUser>("User", UserSchema);
