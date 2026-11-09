"use client";

import { useId, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { cn } from "@/lib/cn";

export interface ChartTable {
  /** Names the first column, then each series. */
  columns: readonly string[];
  rows: readonly (readonly (string | number)[])[];
}

/**
 * The frame every chart sits in. It gives the chart a title, a plain
 * description and a labelled unit, and it always offers the same data as a
 * table, so nothing is available only to someone who can see the picture.
 */
export function ChartFrame({
  title,
  description,
  unit,
  table,
  children,
  className,
}: {
  title: string;
  /** One sentence on what the chart shows and what to look for. */
  description: string;
  /** What the numbers count, for example "habits completed per day". */
  unit: string;
  table: ChartTable;
  /** The chart itself. Give it its own accessible name. */
  children: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  return (
    <figure
      aria-labelledby={titleId}
      className={cn(
        "rounded-card border border-border bg-card p-4 [box-shadow:var(--edge-highlight)] md:p-6",
        className,
      )}
    >
      <Tabs defaultValue="chart">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <figcaption className="grid max-w-[56ch] gap-1">
            <span id={titleId} className="text-body font-semibold">
              {title}
            </span>
            <span className="text-secondary text-text-2">{description}</span>
          </figcaption>
          <TabsList aria-label={`View ${title} as`} className="border-b-0">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="chart">
          {children}
          <p className="mt-3 text-meta text-text-2">Unit: {unit}</p>
        </TabsContent>
        <TabsContent value="table">
          <div
            role="region"
            aria-label={`${title} as a table`}
            tabIndex={0}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[280px] text-left text-secondary">
              <caption className="sr-only">
                {title}. Unit: {unit}.
              </caption>
              <thead>
                <tr>
                  {table.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-border py-2 pr-4 font-medium text-text-2"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) =>
                      cellIndex === 0 ? (
                        <th
                          key={cellIndex}
                          scope="row"
                          className="border-b border-border py-2 pr-4 font-normal"
                        >
                          {cell}
                        </th>
                      ) : (
                        <td
                          key={cellIndex}
                          className="numeral border-b border-border py-2 pr-4"
                        >
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </figure>
  );
}
