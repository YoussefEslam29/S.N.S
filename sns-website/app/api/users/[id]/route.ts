// PATCH  /api/users/[id] — toggle active status (admin only)
// DELETE /api/users/[id] — delete user (admin only)
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Prevent admin from deactivating themselves
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (body.role && ["admin", "receptionist", "technician"].includes(body.role)) {
      updates.role = body.role;
    }
    if (body.name) updates.name = String(body.name).trim().slice(0, 200);

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select("-password -__v")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("[PATCH /api/users/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("[DELETE /api/users/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
