import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "mindsnap_super_secure_jwt_secret_key_2026_x89a"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const token = req.cookies.get("admin_session")?.value;

    let isValid = false;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secretKey);
        if (payload.role === "admin") {
          isValid = true;
        }
      } catch {
        isValid = false;
      }
    }

    // If on login page and already authenticated, redirect to /admin
    if (isLoginPage) {
      if (isValid) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    // If not authenticated and trying to access any other /admin route, redirect to login
    if (!isValid) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
