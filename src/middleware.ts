import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authenticationPaths = ["/login"];

// Define route permissions mapping
const routePermissions: Record<string, string[]> = {
  "/dashboard": ["view:dashboard"],
  "/dashboard/ingredient": ["view:ingredient"],
  "/dashboard/ingredient/new": ["create:ingredient"],
  "/dashboard/stock": ["view:stock"],
  "/dashboard/stock/new": ["create:stock"],
  "/dashboard/purchases": ["view:purchases"],
  "/dashboard/purchases/new": ["create:purchases"],
  "/dashboard/supplier": ["view:supplier"],
  "/dashboard/supplier/new": ["create:supplier"],
  "/dashboard/account": ["view:account"],
  "/dashboard/account/new": ["create:account"],
  "/dashboard/permission": ["view:permission"],
  "/dashboard/permission/new": ["create:permission"],
  "/dashboard/role": ["view:role"],
  "/dashboard/role/new": ["create:role"],
};

// Helper function to check if user has required permissions
function hasPermission(
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

// Helper function to get required permissions for a route
function getRequiredPermissions(pathname: string): string[] {
  // First try exact match
  if (routePermissions[pathname]) {
    return routePermissions[pathname];
  }

  // Handle dynamic routes with IDs (like /dashboard/role/cmcvim1jt00007k8c8ifmmsez)
  // Check if it matches edit pattern
  const editPatterns = [
    { pattern: /^\/dashboard\/role\/[^\/]+$/, permission: "edit:role" },
    {
      pattern: /^\/dashboard\/ingredient\/[^\/]+$/,
      permission: "edit:ingredient",
    },
    { pattern: /^\/dashboard\/stock\/[^\/]+$/, permission: "edit:stock" },
    {
      pattern: /^\/dashboard\/purchases\/[^\/]+$/,
      permission: "edit:purchases",
    },
    { pattern: /^\/dashboard\/supplier\/[^\/]+$/, permission: "edit:supplier" },
    { pattern: /^\/dashboard\/account\/[^\/]+$/, permission: "edit:account" },
    {
      pattern: /^\/dashboard\/permission\/[^\/]+$/,
      permission: "edit:permission",
    },
  ];

  for (const { pattern, permission } of editPatterns) {
    if (pattern.test(pathname)) {
      return [permission];
    }
  }

  // Then try to find the most specific matching route
  const matchingRoutes = Object.keys(routePermissions)
    .filter((route) => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length); // Sort by length descending for most specific match

  if (matchingRoutes.length > 0) {
    return routePermissions[matchingRoutes[0]];
  }

  return [];
}

// Helper function to check if route is protected
function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

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

  // Permission-based access control for protected routes
  if (isLoggedIn && isProtected) {
    const userPermissions = (token.permissions as string[]) || [];
    const requiredPermissions = getRequiredPermissions(pathname);

    // console.log("User permissions:", userPermissions);
    // console.log("Required permissions:", requiredPermissions);

    // If route requires permissions and user doesn't have them
    if (
      requiredPermissions.length > 0 &&
      !hasPermission(userPermissions, requiredPermissions)
    ) {
      console.log("Access denied: insufficient permissions");

      // You can redirect to a "no permission" page or back to home
      return NextResponse.redirect(new URL("/unauthorized", req.url));
      // Or redirect to home: return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Allow everything else
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
