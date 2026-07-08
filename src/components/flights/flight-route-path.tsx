import type { FlightRouteStop } from "@/lib/flights/route";
import { getStopDisplay } from "@/lib/flights/stop-display";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface FlightRoutePathProps {
  stops: FlightRouteStop[];
  className?: string;
}

export function FlightRoutePath({ stops, className }: FlightRoutePathProps) {
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

        return (
          <div key={`${stop.airport}-${index}`} className="flex items-center">
            <div className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 shadow-sm">
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
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </div>
            </div>
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
