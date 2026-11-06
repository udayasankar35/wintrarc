import type { MetadataRoute } from "next";

// Minimal manifest so the app is installable and iOS can offer push in Stage 0.
// Stage 1 extends it with a maskable icon and shortcuts.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WINTRARC",
    short_name: "WINTRARC",
    description: "Become the person you said you'd be.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09090D",
    theme_color: "#09090D",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
