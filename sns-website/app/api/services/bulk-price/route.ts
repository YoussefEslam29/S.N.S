// PATCH /api/services/bulk-price — bulk update pricing by percentage (admin only)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { PriceHistory } from "@/models/PriceHistory";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized — admin only" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const percentage = Number(body.percentage);
    if (isNaN(percentage) || percentage < -50 || percentage > 100) {
      return NextResponse.json(
        { error: "Percentage must be between -50 and 100" },
        { status: 400 }
      );
    }

    // Build filter
    const filter: Record<string, unknown> = {};
    const CATEGORIES = ["wash", "detailing", "ceramic-coating", "ppf", "tinting"] as const;
    if (body.category && CATEGORIES.includes(body.category)) {
      filter.category = body.category;
    }

    const services = await Service.find(filter).lean();

    if (services.length === 0) {
      return NextResponse.json({ error: "No services match the filter" }, { status: 404 });
    }

    const multiplier = 1 + percentage / 100;

    // Save price history and update each service
    const updates = services.map(async (service) => {
      const previousPricing = {
        sedan: service.pricing.sedan,
        suv: service.pricing.suv,
        truck: service.pricing.truck,
      };

      const newPricing = {
        sedan: Math.round(service.pricing.sedan * multiplier),
        suv: Math.round(service.pricing.suv * multiplier),
        truck: Math.round(service.pricing.truck * multiplier),
      };

      // Save history before updating
      await PriceHistory.create({
        service: service._id,
        previousPricing,
        newPricing,
        changedBy: session.user.id,
        reason: `Bulk ${percentage > 0 ? "+" : ""}${percentage}% update${body.category ? ` (${body.category})` : ""}`,
      });

      // Apply the new pricing
      return Service.findByIdAndUpdate(service._id, {
        "pricing.sedan": newPricing.sedan,
        "pricing.suv": newPricing.suv,
        "pricing.truck": newPricing.truck,
      });
    });

    await Promise.all(updates);

    return NextResponse.json({
      data: {
        updated: services.length,
        percentage,
        category: body.category || "all",
      },
    });
  } catch (error) {
    console.error("[PATCH /api/services/bulk-price]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
