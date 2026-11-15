/*
 * Development-only pages and the switch that turns each one on. When a switch
 * is off, the page must answer with a real 404, not a loading screen that
 * only turns into "not found" in the browser.
 */
export const DEV_ROUTE_SWITCHES: Readonly<Record<string, string>> = {
  "/dev/design": "ENABLE_DESIGN_GALLERY",
  "/dev/push-spike": "ENABLE_PUSH_SPIKE",
};

type Env = Readonly<Record<string, string | undefined>>;

/** True when the path is a switched-off development page. */
export function isDevRouteHidden(pathname: string, env: Env): boolean {
  for (const [route, flag] of Object.entries(DEV_ROUTE_SWITCHES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return env[flag] !== "true";
    }
  }
  return false;
}
