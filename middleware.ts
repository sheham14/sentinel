import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isAuthPage =
    nextUrl.pathname.startsWith("/signin") ||
    nextUrl.pathname.startsWith("/welcome");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isPublicRoute = [
    "/",
    "/privacy",
    "/feedback",
    "/terms",
    "/welcome",
  ].includes(nextUrl.pathname);

  // Thread pathname through so (main)/layout can read it for onboarding checks
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);
  const next = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  if (isApiRoute || isPublicRoute) return next();

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (!isLoggedIn && !isAuthPage && !isPublicRoute) {
    return NextResponse.redirect(new URL("/signin", nextUrl));
  }

  return next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};