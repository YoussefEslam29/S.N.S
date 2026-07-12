// GET /api/bookings/installments-due — bookings with unpaid installments due within 7 days
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const bookings = await Booking.find({
      paymentMethod: "installments",
      "installmentPlan.schedule": {
        $elemMatch: {
          paid: false,
          dueDate: { $lte: sevenDaysOut },
        },
      },
    })
      .populate("customer", "name phone")
      .populate("service", "name category")
      .select("customer service installmentPlan price date vehicleType")
      .sort({ "installmentPlan.schedule.dueDate": 1 })
      .lean();

    return NextResponse.json({ data: bookings });
  } catch (error) {
    console.error("[GET /api/bookings/installments-due]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
