import { NextResponse, type NextRequest } from "next/server";
import { isDevRouteHidden } from "@/lib/dev-routes";

/**
 * Answers 404 for development pages that are switched off. The pages also
 * check their own switch, so this is the visible half: without it the page
 * would stream a loading screen with status 200 before reporting "not found".
 */
export function proxy(request: NextRequest) {
  if (isDevRouteHidden(request.nextUrl.pathname, process.env)) {
    return NextResponse.rewrite(new URL("/page-not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dev/:path*"],
};
