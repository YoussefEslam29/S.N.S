// GET /api/timeslots?date=YYYY-MM-DD — get available time slots for a date
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";

/** Working hours: 2 PM – 12 AM (14:00 – 23:00), closed on Friday */
const ALL_SLOTS = [
  "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00", "23:00",
];
const MAX_CAPACITY = 3; // max simultaneous bookings per slot

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Friday = closed
    if (date.getDay() === 5) {
      return NextResponse.json({ data: [], message: "Closed on Friday" });
    }

    // Don't allow past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return NextResponse.json({ data: [], message: "Cannot book past dates" });
    }

    await connectDB();

    // Count existing bookings per slot for this date
    const startOfDay = new Date(dateStr + "T00:00:00");
    const endOfDay = new Date(dateStr + "T23:59:59");

    const bookings = await Booking.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: "$timeSlot",
          count: { $sum: 1 },
        },
      },
    ]);

    const bookingCountBySlot: Record<string, number> = {};
    for (const b of bookings) {
      bookingCountBySlot[b._id] = b.count;
    }

    const slots = ALL_SLOTS.map((time) => ({
      time,
      available: (bookingCountBySlot[time] || 0) < MAX_CAPACITY,
      remaining: MAX_CAPACITY - (bookingCountBySlot[time] || 0),
    }));

    return NextResponse.json({ data: slots });
  } catch (error) {
    console.error("[GET /api/timeslots]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
