import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/interview");

  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && pathname === "/login") {
    const user = req.auth?.user as { role?: string | null; experience?: string | null } | undefined;
    const hasProfile = !!(user?.role && user?.experience);
    const redirectUrl = new URL(hasProfile ? "/dashboard" : "/onboarding", req.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoggedIn) {
    const user = req.auth?.user as { role?: string | null; experience?: string | null } | undefined;
    const hasProfile = !!(user?.role && user?.experience);

    // If trying to access other protected routes without completing onboarding, redirect to /onboarding
    if (!hasProfile && (pathname.startsWith("/dashboard") || pathname.startsWith("/interview"))) {
      const onboardingUrl = new URL("/onboarding", req.nextUrl.origin);
      return NextResponse.redirect(onboardingUrl);
    }

    // If trying to access /onboarding when profile is already complete, redirect to /dashboard
    if (hasProfile && pathname.startsWith("/onboarding")) {
      const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
