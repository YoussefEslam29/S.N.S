// GET  /api/bookings        — list bookings (staff only, with filters)
// POST /api/bookings        — create a booking (public)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Customer } from "@/models/Customer";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const page = Math.max(0, Number(searchParams.get("page") || 0));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate("customer", "name phone vehicleType")
        .populate("service", "name category")
        .select("-__v")
        .sort({ date: -1, timeSlot: 1 })
        .skip(page * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return NextResponse.json({ data: bookings, total, page, limit });
  } catch (error) {
    console.error("[GET /api/bookings]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate customer info
    const name = String(body.customerName ?? "").trim().slice(0, 200);
    const phone = String(body.customerPhone ?? "").trim().slice(0, 20);
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Customer name and phone are required" },
        { status: 400 }
      );
    }

    // Validate booking fields
    const VEHICLE_TYPES = ["sedan", "suv", "truck"] as const;
    if (!VEHICLE_TYPES.includes(body.vehicleType)) {
      return NextResponse.json({ error: "Invalid vehicle type" }, { status: 400 });
    }

    if (!body.serviceId || !body.date || !body.timeSlot) {
      return NextResponse.json(
        { error: "Service, date, and time slot are required" },
        { status: 400 }
      );
    }

    const PAYMENT_METHODS = ["cash", "digital", "installments"] as const;
    const paymentMethod = PAYMENT_METHODS.includes(body.paymentMethod)
      ? body.paymentMethod
      : "cash";

    const price = Number(body.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Find or create customer
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = await Customer.create({
        name,
        phone,
        email: body.customerEmail ? String(body.customerEmail).trim().toLowerCase().slice(0, 200) : undefined,
        vehicleType: body.vehicleType,
        vehicleMake: body.vehicleMake ? String(body.vehicleMake).trim().slice(0, 100) : undefined,
        vehicleModel: body.vehicleModel ? String(body.vehicleModel).trim().slice(0, 100) : undefined,
      });
    }

    // Build installment plan if applicable
    let installmentPlan;
    if (paymentMethod === "installments" && price > 0) {
      const installmentCount = 3;
      const perPayment = Math.ceil(price / installmentCount);
      const schedule = Array.from({ length: installmentCount }, (_, i) => {
        const dueDate = new Date(body.date);
        dueDate.setMonth(dueDate.getMonth() + i);
        return { amount: perPayment, dueDate, paid: false };
      });
      installmentPlan = {
        totalAmount: price,
        paidAmount: 0,
        remainingAmount: price,
        schedule,
      };
    }

    const booking = await Booking.create({
      customer: customer._id,
      service: body.serviceId,
      vehicleType: body.vehicleType,
      date: new Date(body.date),
      timeSlot: String(body.timeSlot).trim().slice(0, 10),
      paymentMethod,
      installmentPlan,
      status: "pending",
      price,
      notes: body.notes ? String(body.notes).trim().slice(0, 1000) : undefined,
    });

    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bookings]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
