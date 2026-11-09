"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { promptInstall, useInstallKind } from "@/lib/pwa/use-install";
import { toast } from "@/lib/toast/store";
import { Button } from "@/components/ui/button";

/**
 * A small install entry for the sidebar and the More page. A button where the
 * browser can install on the spot, a link to the steps where it cannot, and
 * nothing once the app is installed.
 */
export function InstallPrompt({ className }: { className?: string }) {
  const kind = useInstallKind();

  if (kind === "installed" || kind === "unsupported") return null;

  if (kind === "can_prompt") {
    return (
      <Button
        variant="secondary"
        className={className}
        onClick={async () => {
          const outcome = await promptInstall();
          if (outcome === "accepted") {
            toast({ title: "Wintrarc is installed", tone: "success" });
          }
        }}
      >
        <Download aria-hidden className="size-4" />
        Install app
      </Button>
    );
  }

  return (
    <Button asChild variant="secondary" className={className}>
      <Link href="/settings#install">
        <Download aria-hidden className="size-4" />
        How to install
      </Link>
    </Button>
  );
}
