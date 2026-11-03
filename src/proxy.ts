import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";

export const config = {
  // Every page request; skips Next internals, API routes and files with an extension.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request);
  }

  const first = pathname.split("/")[1] ?? "";

  // English keeps the unprefixed URLs: /en/… → /…
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (hasLocale(first)) return NextResponse.next();

  // Unprefixed path: serve the English route behind the scenes.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

async function guardAdmin(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const session = token && secret ? await verifySessionToken(token, secret) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
