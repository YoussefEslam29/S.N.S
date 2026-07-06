// GET   /api/bookings/[id]  — get booking detail (staff only)
// PATCH /api/bookings/[id]  — update booking status (staff only)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { auth } from "@/lib/auth";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const booking = await Booking.findById(id)
      .populate("customer", "name phone email vehicleType vehicleMake vehicleModel")
      .populate("service", "name category pricing duration")
      .select("-__v")
      .lean();

    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: booking });
  } catch (error) {
    console.error("[GET /api/bookings/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const update: Record<string, unknown> = {};

    // Status transitions
    const STATUSES = ["pending", "confirmed", "in-progress", "completed", "cancelled"] as const;
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      // Role-based status permissions
      const role = session.user.role;
      if (role === "technician" && !["in-progress", "completed"].includes(body.status)) {
        return NextResponse.json({ error: "Technicians can only mark in-progress or completed" }, { status: 403 });
      }

      update.status = body.status;
    }

    if (body.notes !== undefined) {
      update.notes = String(body.notes).trim().slice(0, 1000);
    }

    const booking = await Booking.findByIdAndUpdate(id, update, { new: true })
      .populate("customer", "name phone")
      .populate("service", "name category")
      .select("-__v")
      .lean();

    if (!booking) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: booking });
  } catch (error) {
    console.error("[PATCH /api/bookings/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
