// GET    /api/services/[id]  — get single service
// PATCH  /api/services/[id]  — update a service (admin only)
// DELETE /api/services/[id]  — delete a service (admin only)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { PriceHistory } from "@/models/PriceHistory";
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
    await connectDB();
    const service = await Service.findById(id).select("-__v").lean();
    if (!service) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: service });
  } catch (error) {
    console.error("[GET /api/services/:id]", error);
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
    if (!session || session.user.role === "technician") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const update: Record<string, unknown> = {};

    if (body.name?.en !== undefined) update["name.en"] = String(body.name.en).trim().slice(0, 500);
    if (body.name?.ar !== undefined) update["name.ar"] = String(body.name.ar).trim().slice(0, 500);
    if (body.description?.en !== undefined) update["description.en"] = String(body.description.en).trim().slice(0, 500);
    if (body.description?.ar !== undefined) update["description.ar"] = String(body.description.ar).trim().slice(0, 500);

    const CATEGORIES = ["wash", "detailing", "ceramic-coating", "ppf", "tinting"] as const;
    if (body.category !== undefined) {
      if (!CATEGORIES.includes(body.category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      update.category = body.category;
    }

    const hasPricingChange =
      body.pricing?.sedan !== undefined ||
      body.pricing?.suv !== undefined ||
      body.pricing?.truck !== undefined;

    if (body.pricing?.sedan !== undefined) update["pricing.sedan"] = Number(body.pricing.sedan);
    if (body.pricing?.suv !== undefined) update["pricing.suv"] = Number(body.pricing.suv);
    if (body.pricing?.truck !== undefined) update["pricing.truck"] = Number(body.pricing.truck);
    if (body.duration !== undefined) update.duration = Number(body.duration);
    if (body.isActive !== undefined) update.isActive = !!body.isActive;
    if (body.order !== undefined) update.order = Number(body.order);
    if (body.installmentsAllowed !== undefined) update.installmentsAllowed = !!body.installmentsAllowed;
    if (body.maxInstallments !== undefined) update.maxInstallments = Math.min(Math.max(Number(body.maxInstallments), 1), 4);

    // Save price history before updating if pricing changed
    if (hasPricingChange) {
      const existingService = await Service.findById(id).select("pricing").lean();
      if (existingService) {
        await PriceHistory.create({
          service: id,
          previousPricing: {
            sedan: existingService.pricing.sedan,
            suv: existingService.pricing.suv,
            truck: existingService.pricing.truck,
          },
          newPricing: {
            sedan: body.pricing?.sedan !== undefined ? Number(body.pricing.sedan) : existingService.pricing.sedan,
            suv: body.pricing?.suv !== undefined ? Number(body.pricing.suv) : existingService.pricing.suv,
            truck: body.pricing?.truck !== undefined ? Number(body.pricing.truck) : existingService.pricing.truck,
          },
          changedBy: session.user.id,
        });
      }
    }

    const service = await Service.findByIdAndUpdate(id, update, { new: true }).select("-__v").lean();
    if (!service) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: service });
  } catch (error) {
    console.error("[PATCH /api/services/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const service = await Service.findByIdAndDelete(id).lean();
    if (!service) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[DELETE /api/services/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
