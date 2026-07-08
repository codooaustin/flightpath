"use client";

import type { FlightRouteStop } from "@/lib/flights/route";
import { getStopDisplay } from "@/lib/flights/stop-display";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface FlightRoutePathProps {
  stops: FlightRouteStop[];
  selectedStopIndex?: number | null;
  onStopSelect?: (index: number) => void;
  isStopSelectable?: (index: number) => boolean;
  className?: string;
}

export function FlightRoutePath({
  stops,
  selectedStopIndex = null,
  onStopSelect,
  isStopSelectable,
  className,
}: FlightRoutePathProps) {
  if (stops.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>—</p>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-1 gap-y-2",
        className
      )}
    >
      {stops.map((stop, index) => {
        const { icon: Icon, label, iconClassName } = getStopDisplay(
          stop.stop_type,
          index,
          stops.length
        );
        const isSelected = selectedStopIndex === index;
        const isInteractive = Boolean(onStopSelect);
        const canSelect = isInteractive && (isStopSelectable?.(index) ?? true);

        return (
          <div key={`${stop.airport}-${index}`} className="flex items-center">
            <button
              type="button"
              onClick={() => onStopSelect?.(index)}
              disabled={!canSelect}
              aria-label={
                canSelect
                  ? `Show ${stop.airport || "airport"} on map`
                  : undefined
              }
              aria-pressed={canSelect ? isSelected : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 shadow-sm transition-colors",
                canSelect &&
                  "cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 dark:hover:border-sky-600 dark:hover:bg-sky-950/40",
                isSelected &&
                  "border-sky-500 bg-sky-50/60 ring-1 ring-sky-500 dark:border-sky-400 dark:bg-sky-950/70 dark:ring-sky-400",
                !canSelect && "cursor-default opacity-80"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  iconClassName
                )}
                title={label}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="min-w-0 text-left">
                <p className="font-mono text-sm font-bold tracking-wide">
                  {stop.airport || "—"}
                </p>
                <p
                  className={cn(
                    "text-[10px] uppercase tracking-wider",
                    isSelected
                      ? "text-sky-800 dark:text-sky-200"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </p>
              </div>
            </button>
            {index < stops.length - 1 && (
              <ArrowRight
                className="mx-1 h-4 w-4 shrink-0 text-sky-500"
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
