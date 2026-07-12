// PATCH /api/bookings/[id]/installments/[index] — mark a specific installment as paid
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { auth } from "@/lib/auth";

export async function PATCH(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  const { id, index: indexStr } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  const scheduleIndex = parseInt(indexStr, 10);
  if (isNaN(scheduleIndex) || scheduleIndex < 0) {
    return NextResponse.json({ error: "Invalid installment index" }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and receptionist can mark payments
    if (session.user.role === "technician") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.installmentPlan || !booking.installmentPlan.schedule) {
      return NextResponse.json({ error: "No installment plan on this booking" }, { status: 400 });
    }

    if (scheduleIndex >= booking.installmentPlan.schedule.length) {
      return NextResponse.json({ error: "Installment index out of range" }, { status: 400 });
    }

    const installment = booking.installmentPlan.schedule[scheduleIndex];
    if (installment.paid) {
      return NextResponse.json({ error: "Installment already marked as paid" }, { status: 400 });
    }

    // Mark as paid
    installment.paid = true;
    installment.paidDate = new Date();

    // Recalculate totals
    booking.installmentPlan.paidAmount += installment.amount;
    booking.installmentPlan.remainingAmount = Math.max(
      0,
      booking.installmentPlan.totalAmount - booking.installmentPlan.paidAmount
    );

    await booking.save();

    return NextResponse.json({
      data: {
        installmentPlan: booking.installmentPlan,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/bookings/:id/installments/:index]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
