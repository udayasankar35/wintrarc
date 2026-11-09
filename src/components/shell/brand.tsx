import Link from "next/link";
import { ArcRing } from "@/components/arc-ring/arc-ring";
import { cn } from "@/lib/cn";

/** The app icon as a ring: twelve days, eight done, the ninth under way. */
export function Logomark({ size = 28 }: { size?: number }) {
  return (
    <ArcRing
      decorative
      pulse={false}
      totalDays={12}
      completedDays={[1, 2, 3, 4, 5, 6, 7, 8]}
      todayIndex={9}
      size={size}
    />
  );
}

export function Brand({
  showName = true,
  className,
}: {
  showName?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Wintrarc, go to Today"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-control",
        className,
      )}
    >
      <Logomark />
      {showName ? (
        <span className="text-body font-semibold tracking-[-0.01em]">
          Wintrarc
        </span>
      ) : null}
    </Link>
  );
}
