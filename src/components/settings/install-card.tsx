"use client";

import { Download } from "lucide-react";
import { describeInstall } from "@/lib/pwa/install";
import { promptInstall, useInstallKind } from "@/lib/pwa/use-install";
import { toast } from "@/lib/toast/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Installing is the step that makes reminders dependable, so it gets its own card and its own link target. */
export function InstallCard() {
  const kind = useInstallKind();
  const copy = describeInstall(kind);

  return (
    <Card id="install" className="scroll-mt-24">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle as="h2">{copy.title}</CardTitle>
          {kind === "installed" ? (
            <Badge tone="success">Installed</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="max-w-[60ch] text-body text-text-2">{copy.body}</p>
        {copy.steps.length > 0 ? (
          <ol className="grid max-w-[60ch] gap-2">
            {copy.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-body">
                <span className="numeral w-5 shrink-0 text-text-2">
                  {index + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        ) : null}
        {copy.actionLabel ? (
          <div>
            <Button
              variant="primary"
              onClick={async () => {
                const outcome = await promptInstall();
                if (outcome === "accepted") {
                  toast({ title: "Wintrarc is installed", tone: "success" });
                }
              }}
            >
              <Download aria-hidden className="size-4" />
              {copy.actionLabel}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
