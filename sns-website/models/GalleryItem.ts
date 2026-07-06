// models/GalleryItem.ts — Before/after transformation photos
import mongoose, { Schema, model, models, type Document, type Types } from "mongoose";

export interface IGalleryItem extends Document {
  title: { en: string; ar: string };
  beforeImage: string;
  afterImage: string;
  service?: Types.ObjectId;
  vehicleType: "sedan" | "suv" | "truck";
  isFeatured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    title: {
      en: { type: String, required: true, maxlength: 200 },
      ar: { type: String, required: true, maxlength: 200 },
    },
    beforeImage: { type: String, required: true },
    afterImage: { type: String, required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service" },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "truck"],
      required: true,
    },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

GalleryItemSchema.index({ isFeatured: -1, order: 1 });

export const GalleryItem =
  (models.GalleryItem as mongoose.Model<IGalleryItem>) ||
  model<IGalleryItem>("GalleryItem", GalleryItemSchema);
