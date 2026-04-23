import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isOnboarding = nextUrl.pathname === "/onboarding";
  const isAuthPage =
    nextUrl.pathname.startsWith("/signin") ||
    nextUrl.pathname.startsWith("/welcome");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isPublicRoute = ["/", "/privacy", "/terms", "/welcome"].includes(
    nextUrl.pathname,
  );

  // Let API routes and public routes through
  if (isApiRoute || isPublicRoute) {
    return NextResponse.next();
  }

  // Logged-in user hitting sign-in or welcome → send home
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Logged-in user who already completed onboarding hitting /onboarding → send home
  if (isLoggedIn && isOnboarding && session.user.onboardingCompleted) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Logged-in user who hasn't completed onboarding hitting any main page → send to onboarding
  if (
    isLoggedIn &&
    !isOnboarding &&
    !isAuthPage &&
    !session.user.onboardingCompleted
  ) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // Not logged in hitting a protected route → send to sign-in
  if (!isLoggedIn && !isAuthPage && !isPublicRoute) {
    return NextResponse.redirect(new URL("/signin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
