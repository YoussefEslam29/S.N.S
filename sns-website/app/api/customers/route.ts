// GET  /api/customers        — list customers (staff only)
// POST /api/customers        — create a customer (staff only)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
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
    const search = searchParams.get("search");
    const page = Math.max(0, Number(searchParams.get("page") || 0));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 20)));

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    return NextResponse.json({ data: customers, total, page, limit });
  } catch (error) {
    console.error("[GET /api/customers]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const name = String(body.name ?? "").trim().slice(0, 200);
    const phone = String(body.phone ?? "").trim().slice(0, 20);
    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const VEHICLE_TYPES = ["sedan", "suv", "truck"] as const;
    if (!VEHICLE_TYPES.includes(body.vehicleType)) {
      return NextResponse.json({ error: "Invalid vehicle type" }, { status: 400 });
    }

    const customer = await Customer.create({
      name,
      phone,
      email: body.email ? String(body.email).trim().toLowerCase().slice(0, 200) : undefined,
      vehicleType: body.vehicleType,
      vehicleMake: body.vehicleMake ? String(body.vehicleMake).trim().slice(0, 100) : undefined,
      vehicleModel: body.vehicleModel ? String(body.vehicleModel).trim().slice(0, 100) : undefined,
      notes: body.notes ? String(body.notes).trim().slice(0, 1000) : undefined,
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/customers]", error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "Phone number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
