/**
 * middleware.ts — Protects /admin routes using Edge-safe auth config.
 *
 * Uses authConfig (no mongoose/bcrypt) so it runs cleanly in Edge Runtime.
 * The full CredentialsProvider + DB logic stays in lib/auth.ts (Node.js only).
 */
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Create a lightweight NextAuth instance from the Edge-safe config only.
// This avoids importing mongoose/bcrypt which crash the Edge Runtime.
const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  // Matches /admin, /admin/bookings, /admin/services, etc.
  matcher: ["/admin/:path*"],
};
