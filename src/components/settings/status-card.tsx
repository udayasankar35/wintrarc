"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const healthSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  database: z.enum(["ok", "not_configured", "error"]),
  checkedAt: z.string(),
});

type DatabaseState = z.infer<typeof healthSchema>["database"];

type State =
  | { kind: "loading" }
  | { kind: "ready"; database: DatabaseState; checkedAt: Date }
  | { kind: "unreachable" };

const DATABASE_COPY: Record<
  DatabaseState,
  { label: string; tone: "success" | "error" | "neutral"; help?: string }
> = {
  ok: { label: "Connected", tone: "success" },
  not_configured: {
    label: "Not connected",
    tone: "neutral",
    help: "Add your Supabase project URL and publishable key to connect the database.",
  },
  error: {
    label: "Not responding",
    tone: "error",
    help: "The project may be paused. Open the Supabase dashboard and restore it.",
  },
};

/** A live check of the server and database. It reads the same route the daily keep-alive job uses. */
export function StatusCard() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { cache: "no-store" })
      .then((response) => response.json())
      .then((json: unknown) => {
        if (cancelled) return;
        const parsed = healthSchema.safeParse(json);
        setState(
          parsed.success
            ? {
                kind: "ready",
                database: parsed.data.database,
                checkedAt: new Date(parsed.data.checkedAt),
              }
            : { kind: "unreachable" },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "unreachable" });
      });
    return () => {
      cancelled = true;
    };
  }, [round]);

  const database =
    state.kind === "ready" ? DATABASE_COPY[state.database] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">System status</CardTitle>
        <CardDescription>
          Checks that this app can reach its database.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {state.kind === "loading" ? (
          <div
            role="status"
            aria-label="Checking status"
            className="grid gap-2"
          >
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-40" />
          </div>
        ) : (
          <dl className="grid gap-3">
            <div className="flex min-h-8 items-center justify-between gap-4">
              <dt className="text-body">App</dt>
              <dd>
                <Badge tone={state.kind === "ready" ? "success" : "error"}>
                  {state.kind === "ready" ? "Running" : "Not reachable"}
                </Badge>
              </dd>
            </div>
            {database ? (
              <div className="flex min-h-8 items-center justify-between gap-4">
                <dt className="text-body">Database</dt>
                <dd>
                  <Badge tone={database.tone}>{database.label}</Badge>
                </dd>
              </div>
            ) : null}
          </dl>
        )}
        {database?.help ? (
          <p className="max-w-[60ch] text-secondary text-text-2">
            {database.help}
          </p>
        ) : null}
        {state.kind === "unreachable" ? (
          <p className="max-w-[60ch] text-secondary text-text-2">
            The status check could not finish. Check your connection and try
            again.
          </p>
        ) : null}
        {state.kind === "ready" ? (
          <p className="text-meta text-text-2">
            Checked at{" "}
            <span className="numeral">
              {state.checkedAt.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </p>
        ) : null}
        <div>
          <Button
            variant="secondary"
            size="sm"
            loading={state.kind === "loading"}
            onClick={() => {
              setState({ kind: "loading" });
              setRound((value) => value + 1);
            }}
          >
            {state.kind === "loading" ? null : (
              <RefreshCw aria-hidden className="size-4" />
            )}
            Check again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
