import Link from "next/link";
import { formatHours } from "@/lib/calculations/flight-hours";
import { formatCurrency } from "@/lib/calculations/costs";
import { formatDateOnly } from "@/lib/dates";
import type { CalendarEvent } from "@/types/models";
import { cn } from "@/lib/utils";

interface DashboardKpiStripProps {
  totalHours: number;
  totalSpent: number;
  nextEvent: CalendarEvent | null;
  stagePercentage: number;
}

const kpiLinkClass =
  "group flex min-w-0 flex-1 flex-col rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50";

export function DashboardKpiStrip({
  totalHours,
  totalSpent,
  nextEvent,
  stagePercentage,
}: DashboardKpiStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Link href="/logbook" className={kpiLinkClass}>
        <span className="text-xs text-muted-foreground">Total hours</span>
        <span className="text-lg font-semibold group-hover:text-sky-600">
          {formatHours(totalHours)}
        </span>
      </Link>
      <Link href="/costs" className={kpiLinkClass}>
        <span className="text-xs text-muted-foreground">Spent</span>
        <span className="text-lg font-semibold group-hover:text-sky-600">
          {formatCurrency(totalSpent)}
        </span>
      </Link>
      <Link href="/calendar" className={kpiLinkClass}>
        <span className="text-xs text-muted-foreground">Next event</span>
        <span
          className={cn(
            "truncate text-sm font-semibold group-hover:text-sky-600",
            !nextEvent && "font-normal text-muted-foreground"
          )}
        >
          {nextEvent
            ? `${nextEvent.title} · ${formatDateOnly(nextEvent.start_date, "MMM d")}`
            : "No upcoming events"}
        </span>
      </Link>
      <Link href="/roadmap" className={kpiLinkClass}>
        <span className="text-xs text-muted-foreground">Stage progress</span>
        <span className="text-lg font-semibold group-hover:text-sky-600">
          {stagePercentage}%
        </span>
      </Link>
    </div>
  );
}
