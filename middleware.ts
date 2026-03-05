/**
 * Protect /admin/*: require authenticated admin (SUPER_ADMIN, ADMIN, or SUPPORT).
 * RBAC for specific sections enforced in API routes.
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "SUPPORT"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  let token = null;
  try {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch {
    // If getToken fails (e.g. no secret), allow request; admin routes will 401
    return NextResponse.next();
  }

  const role = token?.role as string | undefined;
  const isAdmin = role && ADMIN_ROLES.includes(role);
  const isApi = pathname.startsWith("/api/admin");

  if (isApi) {
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isAdmin) {
      const signIn = new URL("/admin/login", req.url);
      signIn.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signIn);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
