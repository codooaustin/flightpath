import {
  FLIGHT_STOP_LABELS,
  type FlightRouteStop,
} from "@/lib/flights/route";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CircleDot,
  MapPin,
  PlaneLanding,
  PlaneTakeoff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function stopIcon(
  stop: FlightRouteStop,
  index: number,
  total: number
): { icon: LucideIcon; label: string; className: string } {
  if (index === 0 && stop.stop_type === "departure") {
    return {
      icon: PlaneTakeoff,
      label: "Departure",
      className: "bg-sky-100 text-sky-700",
    };
  }
  if (index === total - 1 && stop.stop_type === "landing") {
    return {
      icon: PlaneLanding,
      label: "Landing",
      className: "bg-emerald-100 text-emerald-700",
    };
  }
  if (stop.stop_type === "touch_and_go") {
    return {
      icon: CircleDot,
      label: FLIGHT_STOP_LABELS.touch_and_go,
      className: "bg-amber-100 text-amber-700",
    };
  }
  if (stop.stop_type === "full_stop") {
    return {
      icon: MapPin,
      label: FLIGHT_STOP_LABELS.full_stop,
      className: "bg-violet-100 text-violet-700",
    };
  }
  return {
    icon: MapPin,
    label: "Stop",
    className: "bg-muted text-muted-foreground",
  };
}

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
        const { icon: Icon, label, className: iconClass } = stopIcon(
          stop,
          index,
          stops.length
        );

        return (
          <div key={`${stop.airport}-${index}`} className="flex items-center">
            <div className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 shadow-sm">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  iconClass
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
