"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetryButton() {
  return (
    <Button variant="primary" onClick={() => window.location.reload()}>
      <RefreshCw aria-hidden className="size-4" />
      Try again
    </Button>
  );
}
