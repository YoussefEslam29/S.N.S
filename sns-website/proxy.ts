/**
 * proxy.ts — Protects /admin routes using Edge-safe auth config.
 *
 * Uses authConfig (no mongoose/bcrypt) so it runs cleanly.
 * The full CredentialsProvider + DB logic stays in lib/auth.ts (Node.js only).
 */
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Create a lightweight NextAuth instance from the Edge-safe config only.
const { auth } = NextAuth(authConfig);

// In Next.js 16+, middleware.ts is replaced by proxy.ts and exports a named `proxy` function.
export { auth as proxy };

export const config = {
  // Matches /admin, /admin/bookings, /admin/services, etc.
  matcher: ["/admin/:path*"],
};
