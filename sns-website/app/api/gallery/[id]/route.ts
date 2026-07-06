// DELETE /api/gallery/[id] — remove gallery item (admin only)
// PATCH  /api/gallery/[id] — update gallery item (admin only)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role === "technician") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gallery item ID" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.title) {
      updates.title = {
        en: String(body.title.en ?? "").trim().slice(0, 200),
        ar: String(body.title.ar ?? "").trim().slice(0, 200),
      };
    }
    if (typeof body.isFeatured === "boolean") updates.isFeatured = body.isFeatured;
    if (typeof body.order === "number") updates.order = body.order;

    const item = await GalleryItem.findByIdAndUpdate(id, updates, { new: true })
      .select("-__v")
      .lean();

    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("[PATCH /api/gallery/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid gallery item ID" }, { status: 400 });
    }

    await connectDB();
    const item = await GalleryItem.findByIdAndDelete(id);

    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Gallery item deleted" });
  } catch (error) {
    console.error("[DELETE /api/gallery/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
