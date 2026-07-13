// app/api/auth/[...nextauth]/route.ts — NextAuth.js API route handler
import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  await context.params;
  return handlers.GET(request);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  await context.params;
  return handlers.POST(request);
}
