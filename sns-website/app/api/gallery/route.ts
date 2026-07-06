// GET  /api/gallery        — list gallery items (public)
// POST /api/gallery        — add gallery item (admin only)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const filter: Record<string, unknown> = {};
    if (category) filter["service.category"] = category;
    if (featured === "true") filter.isFeatured = true;

    const items = await GalleryItem.find(filter)
      .populate("service", "name category")
      .select("-__v")
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("[GET /api/gallery]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role === "technician") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const titleEn = String(body.title?.en ?? "").trim().slice(0, 200);
    const titleAr = String(body.title?.ar ?? "").trim().slice(0, 200);
    if (!titleEn || !titleAr) {
      return NextResponse.json({ error: "Title required in both languages" }, { status: 400 });
    }

    if (!body.beforeImage || !body.afterImage) {
      return NextResponse.json({ error: "Before and after images are required" }, { status: 400 });
    }

    const VEHICLE_TYPES = ["sedan", "suv", "truck"] as const;
    if (!VEHICLE_TYPES.includes(body.vehicleType)) {
      return NextResponse.json({ error: "Invalid vehicle type" }, { status: 400 });
    }

    const item = await GalleryItem.create({
      title: { en: titleEn, ar: titleAr },
      beforeImage: String(body.beforeImage).trim(),
      afterImage: String(body.afterImage).trim(),
      service: body.serviceId || undefined,
      vehicleType: body.vehicleType,
      isFeatured: !!body.isFeatured,
      order: Number(body.order) || 0,
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/gallery]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
