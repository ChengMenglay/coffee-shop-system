import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authenticationPaths = ["/login"];

// Helper function to check if route is protected
function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const { pathname } = req.nextUrl;
  const isLoggedIn = !!token;
  const isAuthRoute = authenticationPaths.includes(pathname);
  const isProtected = isProtectedRoute(pathname);

  // Redirect unauthenticated user from homepage to login
  if (pathname === "/" && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Prevent logged-in users from accessing auth routes like login page
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect unauthenticated users trying to access protected routes to login
  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/",
    // Add any other protected routes here
  ],
};
