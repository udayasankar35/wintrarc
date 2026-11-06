import { describe, expect, it, vi } from "vitest";
import { createThrottled } from "./throttle";

describe("createThrottled", () => {
  it("runs the check once and reuses the result inside the ttl", async () => {
    let time = 0;
    const check = vi.fn().mockResolvedValue("ok");
    const run = createThrottled(check, 1000, () => time);

    expect(await run()).toBe("ok");
    time = 999;
    expect(await run()).toBe("ok");
    expect(check).toHaveBeenCalledTimes(1);
  });

  it("runs the check again once the ttl has passed", async () => {
    let time = 0;
    const check = vi
      .fn()
      .mockResolvedValueOnce("first")
      .mockResolvedValue("second");
    const run = createThrottled(check, 1000, () => time);

    expect(await run()).toBe("first");
    time = 1000;
    expect(await run()).toBe("second");
    expect(check).toHaveBeenCalledTimes(2);
  });

  it("shares one in-flight call between concurrent callers", async () => {
    let resolve!: (value: string) => void;
    const check = vi.fn(
      () =>
        new Promise<string>((r) => {
          resolve = r;
        }),
    );
    const run = createThrottled(check, 1000, () => 0);

    const a = run();
    const b = run();
    resolve("shared");
    expect(await a).toBe("shared");
    expect(await b).toBe("shared");
    expect(check).toHaveBeenCalledTimes(1);
  });

  it("does not cache a failure", async () => {
    const check = vi
      .fn()
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValue("back");
    const run = createThrottled(check, 1000, () => 0);

    await expect(run()).rejects.toThrow("down");
    expect(await run()).toBe("back");
    expect(check).toHaveBeenCalledTimes(2);
  });
});
