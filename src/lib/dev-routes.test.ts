import { describe, expect, it } from "vitest";
import { DEV_ROUTE_SWITCHES, isDevRouteHidden } from "./dev-routes";

describe("isDevRouteHidden", () => {
  it("hides the gallery unless its switch is exactly true", () => {
    expect(isDevRouteHidden("/dev/design", {})).toBe(true);
    expect(
      isDevRouteHidden("/dev/design", { ENABLE_DESIGN_GALLERY: "false" }),
    ).toBe(true);
    expect(
      isDevRouteHidden("/dev/design", { ENABLE_DESIGN_GALLERY: "1" }),
    ).toBe(true);
    expect(
      isDevRouteHidden("/dev/design", { ENABLE_DESIGN_GALLERY: "true" }),
    ).toBe(false);
  });

  it("hides the push test unless its own switch is true", () => {
    expect(isDevRouteHidden("/dev/push-spike", {})).toBe(true);
    expect(
      isDevRouteHidden("/dev/push-spike", { ENABLE_PUSH_SPIKE: "true" }),
    ).toBe(false);
  });

  it("does not let one switch open the other page", () => {
    expect(
      isDevRouteHidden("/dev/push-spike", { ENABLE_DESIGN_GALLERY: "true" }),
    ).toBe(true);
    expect(isDevRouteHidden("/dev/design", { ENABLE_PUSH_SPIKE: "true" })).toBe(
      true,
    );
  });

  it("covers a trailing slash and anything below the page", () => {
    expect(isDevRouteHidden("/dev/design/", {})).toBe(true);
    expect(isDevRouteHidden("/dev/design/extra", {})).toBe(true);
  });

  it("leaves every other path alone", () => {
    expect(isDevRouteHidden("/", {})).toBe(false);
    expect(isDevRouteHidden("/settings", {})).toBe(false);
    expect(isDevRouteHidden("/dev/designer", {})).toBe(false);
    expect(isDevRouteHidden("/api/health", {})).toBe(false);
  });

  it("only lists switches that exist in the environment spec", async () => {
    const spec = await import("../../scripts/env-spec.mjs");
    const names = new Set(spec.ENV_SPEC.map((entry) => entry.name));
    for (const flag of Object.values(DEV_ROUTE_SWITCHES)) {
      expect(names.has(flag), flag).toBe(true);
    }
  });
});
