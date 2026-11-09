import type { ReactNode } from "react";
import { MobileTopBar } from "./mobile-top-bar";
import { Rail } from "./rail";
import { Sidebar } from "./sidebar";
import { TabBar } from "./tab-bar";

/*
 * The frame around every signed-in page. Chrome spans the whole window; only
 * the page content is capped at 1200px. Three navigations, one per width:
 * sidebar from 1024px, icon rail from 768px, bottom tab bar below that.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:pl-[72px] lg:pl-[248px]">
      <Sidebar />
      <Rail />
      <MobileTopBar />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1200px] px-4 py-6 pb-[calc(88px+env(safe-area-inset-bottom))] outline-none md:px-8 md:py-10 md:pb-10"
      >
        {children}
      </main>
      <TabBar />
    </div>
  );
}
