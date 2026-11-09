import type { Metadata } from "next";
import { AppearanceCard } from "@/components/settings/appearance-card";
import { InstallCard } from "@/components/settings/install-card";
import { ShortcutsCard } from "@/components/settings/shortcuts-card";
import { StatusCard } from "@/components/settings/status-card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Appearance, installing the app and keyboard shortcuts."
      />
      <div className="grid max-w-2xl gap-6">
        <AppearanceCard />
        <InstallCard />
        <ShortcutsCard />
        <StatusCard />
      </div>
    </>
  );
}
