import type { FlightMapPoint } from "@/lib/flights/map-data";
import { getStopDisplay, parseAirportName } from "@/lib/flights/stop-display";
import { cn } from "@/lib/utils";

interface MapAirportPopupContentProps {
  point: FlightMapPoint;
  index: number;
  total: number;
}

export function MapAirportPopupContent({
  point,
  index,
  total,
}: MapAirportPopupContentProps) {
  const { icon: Icon, label, iconClassName, badgeClassName } = getStopDisplay(
    point.stop_type,
    index,
    total
  );
  const { city, airport } = point.name
    ? parseAirportName(point.name)
    : { city: null, airport: null };

  return (
    <div className="w-[168px] p-2">
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            iconClassName
          )}
        >
          <Icon className="h-3 w-3" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <p className="font-mono text-sm font-bold leading-none tracking-wide">
              {point.code}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-full border px-1.5 py-px text-[9px] font-medium uppercase tracking-wide",
                badgeClassName
              )}
            >
              {label}
            </span>
          </div>
          {city && (
            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {city}
            </p>
          )}
          {airport && (
            <p className="mt-0.5 text-[11px] font-medium leading-tight text-foreground">
              {airport}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
