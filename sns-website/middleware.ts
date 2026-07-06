// middleware.ts — Protect /admin routes, redirect to login if not authenticated
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/admin/((?!login).*)"],
};
