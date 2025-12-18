import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authenticationPaths = ["/login"];

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* -------------------- CORS FOR API -------------------- */
  if (pathname.startsWith("/api")) {
    // Preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res;
  }

  /* -------------------- AUTH LOGIC -------------------- */
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const isLoggedIn = !!token;
  const isAuthRoute = authenticationPaths.includes(pathname);
  const isProtected = isProtectedRoute(pathname);

  if (pathname === "/" && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

/* -------------------- IMPORTANT -------------------- */
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/login", "/"],
};
