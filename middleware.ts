import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  // Not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect root to role dashboard
  if (pathname === "/") {
    switch (token.role) {
      case "ADMIN":
        return NextResponse.redirect(new URL("/admin", req.url));
      case "TEACHER":
        return NextResponse.redirect(new URL("/teacher", req.url));
      case "STUDENT":
        return NextResponse.redirect(new URL("/student", req.url));
      case "PARENT":
        return NextResponse.redirect(new URL("/parent", req.url));
    }
  }

  // Role protection
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (pathname.startsWith("/teacher") && token.role !== "TEACHER") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (pathname.startsWith("/student") && token.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (pathname.startsWith("/parent") && token.role !== "PARENT") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  console.log("TOKEN:", token);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*",
  ],
};
