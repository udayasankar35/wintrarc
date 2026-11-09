import { describe, expect, it } from "vitest";
import {
  DEFAULT_PUSH_TITLE,
  planNotification,
  safeTarget,
  type PushPayloadSource,
} from "./push-logic";

const ORIGIN = "https://wintrarc.example";

function source(json: () => unknown, text = () => ""): PushPayloadSource {
  return { json, text };
}

describe("safeTarget", () => {
  it("keeps same-origin paths and absolute addresses", () => {
    expect(safeTarget("/habits", ORIGIN)).toBe(`${ORIGIN}/habits`);
    expect(safeTarget(`${ORIGIN}/tasks?x=1`, ORIGIN)).toBe(
      `${ORIGIN}/tasks?x=1`,
    );
  });

  it("falls back to the home page for another origin", () => {
    expect(safeTarget("https://evil.example/phish", ORIGIN)).toBe(`${ORIGIN}/`);
    expect(safeTarget("//evil.example/phish", ORIGIN)).toBe(`${ORIGIN}/`);
  });

  it("falls back for missing or non-string values", () => {
    expect(safeTarget(undefined, ORIGIN)).toBe(`${ORIGIN}/`);
    expect(safeTarget(42, ORIGIN)).toBe(`${ORIGIN}/`);
    expect(safeTarget("", ORIGIN)).toBe(`${ORIGIN}/`);
  });

  it("does not follow javascript: or data: addresses", () => {
    expect(safeTarget("javascript:alert(1)", ORIGIN)).toBe(`${ORIGIN}/`);
    expect(safeTarget("data:text/html,x", ORIGIN)).toBe(`${ORIGIN}/`);
  });
});

describe("planNotification", () => {
  it("reads title, body, tag and a safe target from JSON", () => {
    const plan = planNotification(
      source(() => ({
        title: "Evening check-in",
        body: "Two habits left today.",
        tag: "checkin",
        url: "/habits",
      })),
      ORIGIN,
    );
    expect(plan.title).toBe("Evening check-in");
    expect(plan.options.body).toBe("Two habits left today.");
    expect(plan.options.tag).toBe("checkin");
    expect(plan.options.data.url).toBe(`${ORIGIN}/habits`);
  });

  it("uses the text body when the payload is not JSON", () => {
    const plan = planNotification(
      source(
        () => {
          throw new SyntaxError("not json");
        },
        () => "plain words",
      ),
      ORIGIN,
    );
    expect(plan.title).toBe(DEFAULT_PUSH_TITLE);
    expect(plan.options.body).toBe("plain words");
  });

  it("still shows a notification when there is no payload at all", () => {
    const plan = planNotification(null, ORIGIN);
    expect(plan.title).toBe(DEFAULT_PUSH_TITLE);
    expect(plan.options.body).toBe("");
    expect(plan.options.tag).toBeUndefined();
    expect(plan.options.data.url).toBe(`${ORIGIN}/`);
  });

  it("ignores fields of the wrong type", () => {
    const plan = planNotification(
      source(() => ({ title: 5, body: {}, tag: [], url: 7 })),
      ORIGIN,
    );
    expect(plan.title).toBe(DEFAULT_PUSH_TITLE);
    expect(plan.options.body).toBe("");
    expect(plan.options.tag).toBeUndefined();
    expect(plan.options.data.url).toBe(`${ORIGIN}/`);
  });

  it("copes with JSON that is not an object", () => {
    expect(
      planNotification(
        source(() => null),
        ORIGIN,
      ).title,
    ).toBe(DEFAULT_PUSH_TITLE);
    expect(
      planNotification(
        source(() => "hello"),
        ORIGIN,
      ).title,
    ).toBe(DEFAULT_PUSH_TITLE);
  });

  it("never lets a payload point the click at another site", () => {
    const plan = planNotification(
      source(() => ({ url: "https://evil.example" })),
      ORIGIN,
    );
    expect(plan.options.data.url).toBe(`${ORIGIN}/`);
  });
});
