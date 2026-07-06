// GET  /api/services        — list all active services (public)
// POST /api/services        — create a service (admin only)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({ isActive: true })
      .select("-__v")
      .sort({ category: 1, order: 1 })
      .lean();
    return NextResponse.json({ data: services });
  } catch (error) {
    console.error("[GET /api/services]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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

    // Validate & sanitize
    const nameEn = String(body.name?.en ?? "").trim().slice(0, 500);
    const nameAr = String(body.name?.ar ?? "").trim().slice(0, 500);
    const descEn = String(body.description?.en ?? "").trim().slice(0, 500);
    const descAr = String(body.description?.ar ?? "").trim().slice(0, 500);

    if (!nameEn || !nameAr) {
      return NextResponse.json(
        { error: "Name is required in both languages" },
        { status: 400 }
      );
    }

    const CATEGORIES = ["wash", "detailing", "ceramic-coating", "ppf", "tinting"] as const;
    if (!CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const sedan = Number(body.pricing?.sedan);
    const suv = Number(body.pricing?.suv);
    const truck = Number(body.pricing?.truck);
    if (isNaN(sedan) || isNaN(suv) || isNaN(truck) || sedan < 0 || suv < 0 || truck < 0) {
      return NextResponse.json({ error: "Invalid pricing" }, { status: 400 });
    }

    const duration = Number(body.duration);
    if (isNaN(duration) || duration < 15) {
      return NextResponse.json({ error: "Duration must be at least 15 minutes" }, { status: 400 });
    }

    const service = await Service.create({
      name: { en: nameEn, ar: nameAr },
      description: { en: descEn, ar: descAr },
      category: body.category,
      pricing: { sedan, suv, truck },
      duration,
      images: Array.isArray(body.images) ? body.images.slice(0, 10) : [],
      isActive: body.isActive !== false,
      order: Number(body.order) || 0,
      installmentsAllowed: !!body.installmentsAllowed,
      maxInstallments: Math.min(Math.max(Number(body.maxInstallments) || 1, 1), 4),
    });

    return NextResponse.json({ data: service }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/services]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
