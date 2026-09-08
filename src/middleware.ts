import { NextRequest, NextResponse } from "next/server";

/**
 * API protection for Creator Product Intelligence.
 *
 * - Same-origin browser requests are allowed.
 * - External API requests must provide APP_API_KEY.
 * - /api/config is public because it is used by the frontend during startup.
 *
 * This avoids exposing APP_API_KEY in client-side JavaScript.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Config is safe to expose to the frontend.
  if (pathname === "/api/config") {
    return NextResponse.next();
  }

  const expectedKey = process.env.APP_API_KEY;

  // Fail closed in production if API key isn't configured.
  if (!expectedKey) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Server misconfigured: APP_API_KEY is not set" },
        { status: 500 }
      );
    }

    return NextResponse.next();
  }

  const providedKey =
    request.headers.get("x-api-key") ??
    request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");

  // Allow same-origin browser requests.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  let isSameOrigin = false;

  if (origin && host) {
    try {
      isSameOrigin = new URL(origin).host === host;
    } catch {
      isSameOrigin = false;
    }
  }

  if (isSameOrigin) {
    return NextResponse.next();
  }

  // External requests must authenticate.
  if (providedKey !== expectedKey) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
