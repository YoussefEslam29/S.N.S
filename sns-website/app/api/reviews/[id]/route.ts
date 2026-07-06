// PATCH /api/reviews/[id]  — approve/reject/feature review (admin only)
// DELETE /api/reviews/[id] — delete review (admin only)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
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
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (typeof body.isApproved === "boolean") updates.isApproved = body.isApproved;
    if (typeof body.isFeatured === "boolean") updates.isFeatured = body.isFeatured;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const review = await Review.findByIdAndUpdate(id, updates, { new: true })
      .select("-__v")
      .lean();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ data: review });
  } catch (error) {
    console.error("[PATCH /api/reviews/[id]]", error);
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
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    await connectDB();
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("[DELETE /api/reviews/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
