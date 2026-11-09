"use client";

import { ShortcutList } from "@/components/shell/shortcut-help";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ShortcutsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Keyboard shortcuts</CardTitle>
        <CardDescription>
          Press ? anywhere to see this list. Letter shortcuts are ignored while
          you type in a field.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ShortcutList />
      </CardContent>
    </Card>
  );
}
