// GET  /api/reviews        — list approved reviews (public)
// POST /api/reviews        — submit a review (public, pending moderation)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";
    const featured = searchParams.get("featured");

    // If requesting all (including non-approved), require auth
    if (showAll) {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await connectDB();

    const filter: Record<string, unknown> = showAll ? {} : { isApproved: true };
    if (featured === "true") filter.isFeatured = true;

    const reviews = await Review.find(filter)
      .populate("service", "name category")
      .select("-__v")
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error("[GET /api/reviews]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const customerName = String(body.customerName ?? "").trim().slice(0, 200);
    const rating = Number(body.rating);
    const text = String(body.text ?? "").trim().slice(0, 2000);

    if (!customerName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ error: "Review text is required" }, { status: 400 });
    }

    const review = await Review.create({
      customerName,
      rating: Math.round(rating),
      text,
      service: body.serviceId || undefined,
      isApproved: false, // always pending moderation
      isFeatured: false,
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reviews]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
