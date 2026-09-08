import { NextRequest, NextResponse } from "next/server";

/**
 * Minimal auth for a single-user / small-team deployment: every request to
 * /api/* must carry a header matching APP_API_KEY (set in your env).
 *
 * This is intentionally simple — there's no per-user ownership check here
 * because the schema has no `ownerId` column yet. If you add multi-user
 * support later, add an `ownerId` to the `creators` table and check
 * `creator.ownerId === session.userId` inside each route handler in
 * addition to this key check.
 */
export function middleware(request: NextRequest) {
  const expectedKey = process.env.APP_API_KEY;

  // If no key is configured, fail closed in production but allow local dev
  // to run without extra setup.
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
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (providedKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
