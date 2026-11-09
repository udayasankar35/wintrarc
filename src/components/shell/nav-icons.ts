import {
  CalendarCheck,
  ChartNoAxesColumn,
  Ellipsis,
  FileText,
  Lightbulb,
  ListChecks,
  Orbit,
  Repeat,
  Settings,
  Target,
  Timer,
  type LucideIcon,
} from "lucide-react";
import type { NavId } from "@/lib/navigation";

export const NAV_ICONS: Record<NavId, LucideIcon> = {
  today: CalendarCheck,
  habits: Repeat,
  tasks: ListChecks,
  goals: Target,
  arcs: Orbit,
  focus: Timer,
  analytics: ChartNoAxesColumn,
  insights: Lightbulb,
  reports: FileText,
  settings: Settings,
};

export const MORE_ICON = Ellipsis;
