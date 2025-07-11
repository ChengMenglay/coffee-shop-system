import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
const authenticationPath = ["/login"];
const adminPath = ["/dashboard"];
export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });
  const { pathname } = req.nextUrl;
  const isLoggIn = !!token;
  const isAuthRoute = authenticationPath.includes(pathname);
  if (pathname === "/" && token?.role === "Admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname === "/" && !isLoggIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isLoggIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (!isLoggIn && adminPath.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (adminPath.some((path) => pathname.startsWith(path))) {
    if (token?.role === "Customer" || !isLoggIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  mathcher: ["/dashboard/:path*", "/login"],
};
