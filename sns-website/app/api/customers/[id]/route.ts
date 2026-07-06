// GET /api/customers/[id] — customer detail with booking history (staff only)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
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

    const [customer, bookings] = await Promise.all([
      Customer.findById(id).select("-__v").lean(),
      Booking.find({ customer: id })
        .populate("service", "name category")
        .select("-__v")
        .sort({ date: -1 })
        .limit(50)
        .lean(),
    ]);

    if (!customer) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { ...customer, bookings } });
  } catch (error) {
    console.error("[GET /api/customers/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
