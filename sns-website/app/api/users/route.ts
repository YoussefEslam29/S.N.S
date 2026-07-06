// GET  /api/users  — list staff users (admin only)
// POST /api/users  — create staff user (admin only)
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const users = await User.find()
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("[GET /api/users]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const name = String(body.name ?? "").trim().slice(0, 200);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const ROLES = ["admin", "receptionist", "technician"] as const;
    const role = ROLES.includes(body.role) ? body.role : "receptionist";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
    });

    // Never return password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({ data: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/users]", error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
