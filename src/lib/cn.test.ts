import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("keeps a font size and a colour that share the text- prefix", () => {
    expect(cn("text-secondary", "text-text-2")).toBe(
      "text-secondary text-text-2",
    );
    expect(cn("text-text-2", "text-meta")).toBe("text-text-2 text-meta");
  });

  it("lets the last size win", () => {
    expect(cn("text-body", "text-secondary")).toBe("text-secondary");
    expect(cn("text-title", "text-display")).toBe("text-display");
  });

  it("lets the last colour win", () => {
    expect(cn("text-text", "text-error")).toBe("text-error");
    expect(cn("bg-card", "bg-card-elevated")).toBe("bg-card-elevated");
    expect(cn("border-border", "border-control")).toBe("border-control");
  });

  it("lets the last radius and weight win", () => {
    expect(cn("rounded-card", "rounded-control")).toBe("rounded-control");
    expect(cn("font-normal", "font-semibold")).toBe("font-semibold");
  });

  it("keeps a size and a weight together and drops falsy values", () => {
    expect(cn("text-secondary", false, undefined, "font-medium")).toBe(
      "text-secondary font-medium",
    );
  });
});
