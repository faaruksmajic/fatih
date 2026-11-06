import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { DEFAULT_LOCALE, hasLocale } from "@/i18n/config";

export const config = {
  // Every page request; skips Next internals, API routes and files with an extension.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

/** The admin lives on its own subdomain (backoffice.fatiharch.online, or backoffice.localhost in dev). */
const ADMIN_SUBDOMAIN = "backoffice";
const PRODUCTION_ADMIN_ORIGIN = "https://backoffice.fatiharch.online";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = requestHostname(request);
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (hostname.startsWith(`${ADMIN_SUBDOMAIN}.`)) {
    // Old /admin/… links: drop the prefix so URLs stay clean.
    if (isAdminPath) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice("/admin".length) || "/";
      return NextResponse.redirect(url, 308);
    }
    return guardAdmin(request, `/admin${pathname === "/" ? "" : pathname}`);
  }

  // The public site no longer serves the admin; send it to the backoffice subdomain.
  if (isAdminPath) {
    const target = new URL(pathname.slice("/admin".length) || "/", adminOrigin(request));
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 308);
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

/** The hostname the visitor typed; nextUrl can report the server's own host in dev. */
function requestHostname(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  return host.split(":")[0].toLowerCase();
}

function adminOrigin(request: NextRequest) {
  const hostname = requestHostname(request);
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const port = request.headers.get("host")?.split(":")[1];
    return `${request.nextUrl.protocol}//${ADMIN_SUBDOMAIN}.localhost${port ? `:${port}` : ""}`;
  }
  return PRODUCTION_ADMIN_ORIGIN;
}

/** Serves the internal /admin route for a backoffice URL, sending signed-out visitors to /login. */
async function guardAdmin(request: NextRequest, adminPath: string) {
  const url = request.nextUrl.clone();
  url.pathname = adminPath;

  if (adminPath === "/admin/login" || adminPath.startsWith("/admin/login/")) {
    return NextResponse.rewrite(url);
  }

  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const session = token && secret ? await verifySessionToken(token, secret) : null;

  if (!session) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    return NextResponse.redirect(login);
  }

  return NextResponse.rewrite(url);
}
