import { describe, expect, it } from "vitest";
import webpush from "web-push";
import { urlBase64ToUint8Array } from "./vapid-client";

describe("urlBase64ToUint8Array", () => {
  it("decodes a known value", () => {
    // "hello" in standard base64 is "aGVsbG8=" (URL-safe, unpadded: "aGVsbG8").
    expect(Array.from(urlBase64ToUint8Array("aGVsbG8"))).toEqual([
      104, 101, 108, 108, 111,
    ]);
  });

  it("handles the URL-safe alphabet", () => {
    // 0xfb 0xff 0xfe encodes to "+//+" in standard base64 and "-__-" URL-safe.
    expect(Array.from(urlBase64ToUint8Array("-__-"))).toEqual([251, 255, 254]);
  });

  it("decodes a generated VAPID public key to a 65-byte uncompressed P-256 point", () => {
    const { publicKey } = webpush.generateVAPIDKeys();
    const bytes = urlBase64ToUint8Array(publicKey);
    expect(bytes.length).toBe(65);
    expect(bytes[0]).toBe(0x04);
  });
});
