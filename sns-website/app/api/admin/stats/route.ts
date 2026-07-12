// GET /api/admin/stats — aggregate dashboard stats (admin/staff only)
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Customer } from "@/models/Customer";
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

    // Today range
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // This week range (Saturday to Thursday for Egypt, but simpler: last 7 days)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    // Last week range (7-14 days ago)
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    lastWeekStart.setHours(0, 0, 0, 0);

    const [
      todayBookings,
      pending,
      completedThisWeek,
      totalCustomers,
      weeklyRevenueResult,
      lastWeekRevenueResult,
      installmentsDue,
    ] = await Promise.all([
      // Today's bookings count
      Booking.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd },
      }),
      // Pending bookings
      Booking.countDocuments({ status: "pending" }),
      // Completed this week
      Booking.countDocuments({
        status: "completed",
        date: { $gte: weekStart, $lte: now },
      }),
      // Total customers
      Customer.countDocuments(),
      // Weekly revenue (completed bookings)
      Booking.aggregate([
        {
          $match: {
            status: "completed",
            date: { $gte: weekStart, $lte: now },
          },
        },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
      // Last week revenue for comparison
      Booking.aggregate([
        {
          $match: {
            status: "completed",
            date: { $gte: lastWeekStart, $lt: weekStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
      // Installments due within 7 days
      Booking.find({
        paymentMethod: "installments",
        "installmentPlan.schedule": {
          $elemMatch: {
            paid: false,
            dueDate: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
          },
        },
      })
        .populate("customer", "name phone")
        .populate("service", "name")
        .select("customer service installmentPlan price")
        .lean(),
    ]);

    const weeklyRevenue = weeklyRevenueResult[0]?.total ?? 0;
    const lastWeekRevenue = lastWeekRevenueResult[0]?.total ?? 0;

    return NextResponse.json({
      data: {
        todayBookings,
        pending,
        completedThisWeek,
        totalCustomers,
        weeklyRevenue,
        lastWeekRevenue,
        installmentsDue,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
