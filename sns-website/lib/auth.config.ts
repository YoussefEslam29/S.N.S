/**
 * auth.config.ts — Edge-safe NextAuth configuration.
 *
 * ⚠️  This file MUST NOT import mongoose, bcrypt, connectDB, or any
 *     Node.js-only module. It runs inside Next.js Middleware (Edge Runtime)
 *     which does not support Node.js built-ins.
 *
 *     The full provider + DB config lives in lib/auth.ts (Node.js only).
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * authorized() — called by middleware on every matched request.
     * Returns true  → allow the request through.
     * Returns false → redirect to signIn page (defined in `pages` above).
     * Returns a Response → custom redirect.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isOnLoginPage = path === "/admin/login";

      // Already logged in and trying to access login page → send to dashboard
      if (isOnLoginPage && isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      // On login page and not logged in → allow (show the form)
      if (isOnLoginPage) return true;

      // Any other /admin/* route → must be logged in
      return isLoggedIn;
    },
  },
  providers: [], // Providers are defined in lib/auth.ts (Node.js only)
};
