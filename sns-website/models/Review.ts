// models/Review.ts — Customer reviews with moderation gate
import mongoose, { Schema, model, models, type Document, type Types } from "mongoose";

export interface IReview extends Document {
  customerName: string;
  rating: number; // 1-5
  text: string;
  service?: Types.ObjectId;
  isApproved: boolean; // moderation gate
  isFeatured: boolean; // show on homepage
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    customerName: { type: String, required: true, maxlength: 200, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, maxlength: 2000, trim: true },
    service: { type: Schema.Types.ObjectId, ref: "Service" },
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ isApproved: 1, isFeatured: -1, createdAt: -1 });

export const Review =
  (models.Review as mongoose.Model<IReview>) ||
  model<IReview>("Review", ReviewSchema);
