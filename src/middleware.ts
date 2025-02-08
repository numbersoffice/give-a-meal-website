import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const pathsWithoutLocale = [
  "/_next/",
  "/api/",
  "/apple-app-site-association",
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt",
];
const protectedPaths = ["/donors/profile"];

/**
 * Transforms the request object by adding locale and auth data
 * @param request
 * @returns request
 */
export async function middleware(request: NextRequest) {
  let currentPathname = request.nextUrl.pathname;

  // Skip: paths that should not have a locale
  const shouldExclude = pathsWithoutLocale.some((path) =>
    currentPathname.startsWith(path)
  );

  if (shouldExclude) {
    return NextResponse.next();
  }

  // Locale: paths that are missing a locale
  currentPathname = getPathnameWithLocale(request);

  // Skip: paths that should not have authentication
  let pathIsProtected = false;
  for (const path of protectedPaths) {
    if (currentPathname.includes(path)) {
      pathIsProtected = true;
    }
  }

  // Response: redirect to login if the path is protected and not authenticated
  if (!pathIsProtected) {
    // Prevent re-direct if the current pathname is the same as the request pathname
    if (currentPathname === request.nextUrl.pathname) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(
        new URL(
          currentPathname + request.nextUrl.search,
          request.nextUrl.origin
        )
      );
    }
  }

  // Authentication:
  // 1) Return pathname unchanged if no autnetication is needed
  // 2) Return data with user info if authenticated
  // 3) Return pathname to login url if not authenticated
  const result = await handleAuthentication(request, currentPathname);
  if (result.pathname) {
    currentPathname = result.pathname;
  }

  // Pass through existing query parameters
  const params = new URLSearchParams(request.nextUrl.search);

  // Add user data to the query parameters
  if (result.data) {
    !params.get("uid") && params.append("uid", result.data.uid);
    !params.get("email") && params.append("email", result.data.email);
  }

  // Edit pathname with query parameters
  currentPathname = `${currentPathname}?${params.toString()}`;

  // Response: create new URL
  const url = new URL(currentPathname, request.nextUrl.origin);
  console.log(`New URL: ${url}`);
  console.log(`Host Header: ${request.headers.get("host")}`);

  // Response: return the modified url and query parameters
  // Prevent re-direct if the current pathname is the same as the request pathname
  if (currentPathname === request.nextUrl.pathname + request.nextUrl.search) {
    return NextResponse.next();
  } else {
    return NextResponse.redirect(url);
  }
}

/****************************************************/
/******************** FUNCTIONS *********************/
/****************************************************/

type AuthResult = {
  pathname: string;
  data: null | { uid: string; email: string };
};

// Adjusted routing logic to only determine the target pathname
function getPathnameWithLocale(request: NextRequest): string {
  let pathname = request.nextUrl.pathname;

  // Check if pathname is missing locale
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    pathname = `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
  }

  return pathname; // Return the current pathname if no modifications are needed
}

/**
 * Get the locale from the request headers
 * @param {NextRequest} request
 * @returns {string | undefined} The locale or undefined if not found
 */
function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales = Array.from(i18n.locales);
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  );
  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale;
}

/**
 * Verifies a firebase ID token
 * @param request
 * @param pathname The desired pathname (if different from the request)
 * @param protectedPaths The paths that require authentication
 * @returns The user's email and uid or null
 */
async function handleAuthentication(
  request: NextRequest,
  pathname: string
): Promise<AuthResult> {
  let authResulst: AuthResult = {
    pathname: pathname,
    data: null,
  };

  // Verify ID token
  try {
    const cookie = request.headers.get("cookie") || "";
    let response = await fetch(
      `${request.nextUrl.origin}/api/auth/verify-id-token`,
      { headers: { cookie } }
    );

    // Return user data
    if (response.ok) {
      const res = await response.json();
      authResulst.data = { email: res.email, uid: res.uid };
    } else {
      // Redirect to login if not authenticated
      authResulst.pathname = "donors/login";
    }
  } catch (err) {}
  return authResulst;
}
