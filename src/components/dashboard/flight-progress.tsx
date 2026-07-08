"use client";

import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightProgressProps {
  value: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  iconClassName?: string;
}

export function FlightProgress({
  value,
  className,
  trackClassName,
  indicatorClassName,
  iconClassName,
}: FlightProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const planeLeft = clamped <= 0 ? 0 : clamped >= 100 ? 100 : clamped;

  return (
    <div className={cn("relative pt-4", className)}>
      <div
        className="pointer-events-none absolute top-0 z-10 transition-[left] duration-300"
        style={{
          left: `${planeLeft}%`,
          transform: `translateX(${planeLeft <= 0 ? "0" : planeLeft >= 100 ? "-100%" : "-50%"})`,
        }}
        aria-hidden
      >
        <Plane
          className={cn("h-3.5 w-3.5 rotate-45 text-sky-600", iconClassName)}
        />
      </div>
      <div
        className={cn(
          "h-2 w-full overflow-hidden rounded-full bg-muted",
          trackClassName
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full bg-sky-600 transition-all duration-300",
            indicatorClassName
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
