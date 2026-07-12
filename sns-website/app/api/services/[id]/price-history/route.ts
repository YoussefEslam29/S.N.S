// GET /api/services/[id]/price-history — get price change history for a service
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const history = await PriceHistory.find({ service: id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-__v")
      .lean();

    return NextResponse.json({ data: history });
  } catch (error) {
    console.error("[GET /api/services/:id/price-history]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
