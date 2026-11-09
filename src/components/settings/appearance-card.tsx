"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { setThemePreference, useThemePreference } from "@/lib/theme/use-theme";
import type { ThemePreference } from "@/lib/theme/theme";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";

export function AppearanceCard() {
  const preference = useThemePreference();
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Appearance</CardTitle>
        <CardDescription>
          Wintrarc follows your device unless you pick a theme. The choice is
          saved on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SegmentedControl<ThemePreference>
          label="Theme"
          value={preference}
          onValueChange={setThemePreference}
          options={[
            {
              value: "system",
              label: "System",
              icon: <Monitor aria-hidden className="size-4" />,
            },
            {
              value: "light",
              label: "Light",
              icon: <Sun aria-hidden className="size-4" />,
            },
            {
              value: "dark",
              label: "Dark",
              icon: <Moon aria-hidden className="size-4" />,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
