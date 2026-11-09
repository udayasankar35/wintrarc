import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { themeInitScript } from "@/lib/theme/script";
import { THEME_COLORS } from "@/lib/theme/theme";
import { numeralFont, textFont } from "./fonts";

export const metadata: Metadata = {
  title: { default: "Wintrarc", template: "%s | Wintrarc" },
  description: "Become the person you said you'd be.",
  applicationName: "Wintrarc",
  appleWebApp: {
    capable: true,
    title: "Wintrarc",
    // "black" keeps the iPhone status bar readable in both themes.
    statusBarStyle: "black",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
  ],
  width: "device-width",
  initialScale: 1,
  // Lets the page draw to the screen edges; the shell pads for the notch and
  // home indicator with env(safe-area-inset-*).
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-theme-preference="system"
      // The inline script below sets the theme attributes before hydration.
      suppressHydrationWarning
      className={`${textFont.variable} ${numeralFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
