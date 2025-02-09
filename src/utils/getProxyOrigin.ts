import { NextRequest } from "next/server";

/**
 * Get the origin URL from the request headers.
 * (Might be necessary for Next.js apps behind a reverse proxy)
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {string} The origin URL.
 */
export default function getProxyOrigin(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const origin = proto + "://" + host;

  return origin;
}
