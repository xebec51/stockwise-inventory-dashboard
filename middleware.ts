import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

import { canAccessDashboardPath, type AppRole } from "@/config/role-access";

export default withAuth(
  function middleware(request) {
    if (request.nextUrl.pathname === "/login") {
      const token = request.nextauth.token;

      if (token?.role && token?.status === "ACTIVE") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      return NextResponse.next();
    }

    const token = request.nextauth.token;

    if (!token?.role || !token?.status) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token.status !== "ACTIVE") {
      return NextResponse.redirect(
        new URL(`/login?error=${token.status}`, request.url)
      );
    }

    if (!canAccessDashboardPath(token.role as AppRole, request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
