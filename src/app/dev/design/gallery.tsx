"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  Download,
  Menu,
  Monitor,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
} from "lucide-react";
import { ArcRing } from "@/components/arc-ring/arc-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartFrame } from "@/components/ui/chart-frame";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat } from "@/components/ui/stat";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField } from "@/components/ui/text-field";
import { toast, undoable } from "@/lib/toast/store";
import { setThemePreference, useThemePreference } from "@/lib/theme/use-theme";
import type { ThemePreference } from "@/lib/theme/theme";

/*
 * Every component in every state, for the owner to look at and for the
 * accessibility tests to scan. The data below is sample data and says so.
 */

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="grid gap-4">
      <h2 id={id} className="text-subhead font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

const SWATCHES = [
  ["bg", "Page"],
  ["bg-2", "Sidebar, wells"],
  ["card", "Cards"],
  ["card-elevated", "Dialogs, menus"],
  ["accent", "Primary action"],
  ["accent-2", "Primary hover"],
  ["success", "Done"],
  ["error", "Problem"],
  ["text", "Text"],
  ["text-2", "Quiet text"],
] as const;

const SAMPLE_DONE_30 = [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15];
const SAMPLE_DONE_60 = Array.from({ length: 41 }, (_, i) => i + 1).filter(
  (day) => day % 7 !== 0,
);
const SAMPLE_DONE_90 = Array.from({ length: 63 }, (_, i) => i + 1).filter(
  (day) => day % 9 !== 0,
);

const SAMPLE_WEEK = [
  { day: "Mon", value: 4 },
  { day: "Tue", value: 5 },
  { day: "Wed", value: 3 },
  { day: "Thu", value: 5 },
  { day: "Fri", value: 2 },
  { day: "Sat", value: 4 },
  { day: "Sun", value: 5 },
];

function SampleBars() {
  const max = 5;
  const width = 420;
  const height = 160;
  const gap = 12;
  const barWidth =
    (width - gap * (SAMPLE_WEEK.length - 1)) / SAMPLE_WEEK.length;
  return (
    <svg
      viewBox={`0 0 ${width} ${height + 28}`}
      role="img"
      aria-label="Bar chart of sample habits completed on each day of one week. Values: Monday 4, Tuesday 5, Wednesday 3, Thursday 5, Friday 2, Saturday 4, Sunday 5."
      className="h-auto w-full max-w-xl"
    >
      {SAMPLE_WEEK.map((entry, index) => {
        const barHeight = (entry.value / max) * height;
        const x = index * (barWidth + gap);
        return (
          <g key={entry.day}>
            <rect
              x={x}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              rx={4}
              className="fill-accent-graphic"
            />
            <text
              x={x + barWidth / 2}
              y={height - barHeight - 6}
              textAnchor="middle"
              className="numeral fill-text text-[12px]"
            >
              {entry.value}
            </text>
            <text
              x={x + barWidth / 2}
              y={height + 20}
              textAnchor="middle"
              className="fill-text-2 text-[12px]"
            >
              {entry.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Gallery() {
  const preference = useThemePreference();
  const [agree, setAgree] = useState<boolean | "indeterminate">(
    "indeterminate",
  );
  const [notify, setNotify] = useState(true);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const emailError =
    emailTouched && !email.includes("@")
      ? "Enter an email address with an @, such as sam@example.com."
      : undefined;
  const [progress, setProgress] = useState(18);

  return (
    <div className="grid gap-12">
      <PageHeader
        title="Design gallery"
        description="Every component in every state. All numbers and names here are sample data."
        actions={
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
        }
      />

      <Section id="g-type" title="Type">
        <Card>
          <CardContent className="grid gap-3">
            <p className="text-display font-semibold">Display 40, semibold</p>
            <p className="text-title font-semibold">Title 28, semibold</p>
            <p className="text-subhead font-semibold">Subhead 20, semibold</p>
            <p className="text-body">
              Body 16, regular. Calm, plain sentences.
            </p>
            <p className="text-secondary font-medium">Secondary 14, medium</p>
            <p className="text-meta text-text-2">
              Meta 12, for timestamps and key caps
            </p>
            <p className="numeral text-title">0123456789 42 days 87%</p>
          </CardContent>
        </Card>
      </Section>

      <Section id="g-colour" title="Colour">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SWATCHES.map(([token, use]) => (
            <li
              key={token}
              className="overflow-hidden rounded-card border border-border bg-card"
            >
              <div
                aria-hidden
                className="h-14 border-b border-border"
                style={{ background: `var(--${token})` }}
              />
              <div className="p-3">
                <p className="text-secondary font-medium">{token}</p>
                <p className="text-meta text-text-2">{use}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="g-buttons" title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Save changes</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Skip for now</Button>
          <Button variant="danger">
            <Trash2 aria-hidden className="size-4" />
            Delete habit
          </Button>
          <Button variant="primary" loading>
            Saving
          </Button>
          <Button variant="secondary" disabled>
            Unavailable
          </Button>
          <Button variant="secondary" size="sm">
            Small
          </Button>
          <Button variant="secondary" size="lg">
            Large
          </Button>
          <Button asChild variant="secondary">
            <Link href="/settings">
              <Settings aria-hidden className="size-4" />
              Open settings
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <IconButton label="Open menu" icon={Menu} />
          <IconButton
            label="Jump to a section"
            icon={Search}
            shortcut={["Mod", "k"]}
          />
          <IconButton label="Add habit" icon={Plus} variant="secondary" />
          <IconButton
            label="Turn on reminders"
            icon={Bell}
            variant="secondary"
          />
          <IconButton
            label="Download report"
            icon={Download}
            variant="secondary"
            disabled
          />
        </div>
      </Section>

      <Section id="g-forms" title="Form controls">
        <Card>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <TextField
              label="Habit name"
              hint="Short and specific works best, such as Read 10 pages."
              placeholder="Read 10 pages"
            />
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              error={emailError}
              hint="We only use it to sign you in."
              required
            />
            <SelectField
              label="Repeats"
              hint="You can change this later."
              defaultValue="daily"
              options={[
                { value: "daily", label: "Every day" },
                { value: "weekdays", label: "Weekdays" },
                { value: "weekly", label: "Once a week" },
              ]}
            />
            <SelectField
              label="Arc length"
              placeholder="Choose 30, 60 or 90 days"
              options={[
                { value: "30", label: "30 days" },
                { value: "60", label: "60 days" },
                { value: "90", label: "90 days" },
              ]}
            />
            <div className="grid gap-1">
              <Checkbox label="Remind me daily" defaultChecked />
              <Checkbox
                label="Add a minimum version"
                description="A smaller version you can still do on a hard day."
              />
              <Checkbox
                label="Share my progress"
                checked={agree}
                onCheckedChange={setAgree}
              />
            </div>
            <div className="grid gap-1">
              <Switch
                label="Weekly summary"
                description="One short note every Sunday."
                checked={notify}
                onCheckedChange={setNotify}
              />
              <Switch label="Sound" disabled />
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section id="g-overlays" title="Dialog, drawers, popover and toasts">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Delete a habit</Button>
            </DialogTrigger>
            <DialogContent
              title="Delete Read 10 pages?"
              description="Its history and streak are removed from this account. You can undo this for a few seconds afterwards."
            >
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Keep habit</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="danger"
                    onClick={() =>
                      undoable("Read 10 pages deleted", () =>
                        toast({
                          title: "Read 10 pages restored",
                          tone: "success",
                        }),
                      )
                    }
                  >
                    Delete Read 10 pages
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="secondary">Side panel</Button>
            </DrawerTrigger>
            <DrawerContent
              side="right"
              title="Edit habit"
              description="Longer edits open beside the page."
            >
              <TextField label="Habit name" defaultValue="Read 10 pages" />
            </DrawerContent>
          </Drawer>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="secondary">Bottom sheet</Button>
            </DrawerTrigger>
            <DrawerContent side="bottom" title="Add to today">
              <p className="text-body text-text-2">
                On a phone, quick actions rise from the bottom edge.
              </p>
            </DrawerContent>
          </Drawer>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="text-secondary font-medium">Minimum version</p>
              <p className="mt-1 text-secondary text-text-2">
                The smallest version that still counts, for days when energy is
                low.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => toast({ title: "Saved" })}>
            Plain toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Habit added",
                description: "Read 10 pages, every day.",
                tone: "success",
              })
            }
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Could not save",
                description:
                  "You are offline. Your change is kept and will sync when you reconnect.",
                tone: "error",
              })
            }
          >
            Error toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              undoable("Task archived", () =>
                toast({ title: "Task restored", tone: "success" }),
              )
            }
          >
            Toast with Undo
          </Button>
        </div>
      </Section>

      <Section id="g-tabs" title="Tabs">
        <Tabs defaultValue="week">
          <TabsList aria-label="Range">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="arc">Arc</TabsTrigger>
          </TabsList>
          <TabsContent value="week">
            <p className="text-body text-text-2">
              Seven days, newest on the right.
            </p>
          </TabsContent>
          <TabsContent value="month">
            <p className="text-body text-text-2">
              Thirty days in a calendar grid.
            </p>
          </TabsContent>
          <TabsContent value="arc">
            <p className="text-body text-text-2">
              Your whole arc, one segment per day.
            </p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section id="g-surfaces" title="Cards, stats, badges and progress">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Read 10 pages</CardTitle>
              <CardDescription>Every day</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Stat
                value={12}
                unit="days"
                label="Current streak"
                hint="Best: 21 days"
              />
              <Progress
                label="Consistency this arc"
                value={progress}
                max={30}
              />
              <div className="flex flex-wrap gap-2">
                <Badge>Habit</Badge>
                <Badge tone="success">Done today</Badge>
                <Badge tone="error">Overdue</Badge>
                <Badge tone="outline">Minimum version</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-5">
              <Stat
                size="lg"
                value="87"
                unit="%"
                label="Consistency"
                hint="Last 30 days"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setProgress((value) => (value >= 30 ? 0 : value + 6))
                }
              >
                Advance progress
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid gap-3" aria-busy="true">
              <p className="text-secondary text-text-2">Loading skeleton</p>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </CardContent>
          </Card>
        </div>
        <EmptyState
          title="No habits yet"
          description="Habits are the small things you repeat. Once you add one, it appears here."
          action={<Button variant="primary">Add a habit</Button>}
        />
      </Section>

      <Section id="g-ring" title="Arc ring">
        <Card>
          <CardContent className="flex flex-wrap items-end gap-10">
            <ArcRing
              totalDays={30}
              completedDays={SAMPLE_DONE_30}
              todayIndex={16}
              size={180}
            >
              <Stat value="13" unit="of 16" label="days done" />
            </ArcRing>
            <ArcRing
              totalDays={60}
              completedDays={SAMPLE_DONE_60}
              todayIndex={42}
              size={160}
            />
            <ArcRing
              totalDays={90}
              completedDays={SAMPLE_DONE_90}
              todayIndex={64}
              size={160}
            />
            <ArcRing totalDays={30} completedDays={[]} size={96} />
          </CardContent>
        </Card>
      </Section>

      <Section id="g-chart" title="Chart frame">
        <ChartFrame
          title="Habits completed this week"
          description="Sample data. Most days land near the top; Friday dipped."
          unit="habits completed per day, out of 5"
          table={{
            columns: ["Day", "Habits completed"],
            rows: SAMPLE_WEEK.map((entry) => [entry.day, entry.value]),
          }}
        >
          <SampleBars />
        </ChartFrame>
      </Section>
    </div>
  );
}
