import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MORE_ITEMS } from "@/lib/navigation";
import { InstallPrompt } from "@/components/shell/install-prompt";
import { NAV_ICONS } from "@/components/shell/nav-icons";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "More" };

export default function MorePage() {
  return (
    <>
      <PageHeader
        title="More"
        description="The sections that do not have a tab of their own."
      />
      <Card className="max-w-2xl overflow-hidden">
        <ul className="divide-y divide-border">
          {MORE_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.id];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex min-h-16 items-center gap-4 px-4 py-3 hover:bg-card-elevated"
                >
                  <Icon aria-hidden className="size-5 shrink-0 text-text-2" />
                  <span className="grid flex-1">
                    <span className="text-body font-medium">{item.label}</span>
                    <span className="text-secondary text-text-2">
                      {item.description}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden
                    className="size-5 shrink-0 text-text-2"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
      <div className="mt-6 max-w-2xl">
        <InstallPrompt className="w-full sm:w-auto" />
      </div>
    </>
  );
}
