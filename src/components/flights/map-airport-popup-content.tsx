import type { FlightMapPoint } from "@/lib/flights/map-data";
import { FLIGHT_STOP_SHORT } from "@/lib/flights/route";
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
  const { icon: Icon, iconClassName, badgeClassName } = getStopDisplay(
    point.stop_type,
    index,
    total
  );
  const airport = point.name ? parseAirportName(point.name).airport : null;

  return (
    <div className="min-w-[112px] max-w-[188px] py-0.5 pl-1.5 pr-4">
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
            iconClassName
          )}
        >
          <Icon className="h-2.5 w-2.5" aria-hidden />
        </span>
        <p className="font-mono text-xs font-bold leading-none tracking-wide text-popover-foreground">
          {point.code}
        </p>
        <span
          className={cn(
            "shrink-0 rounded border px-1 py-px text-[8px] font-medium uppercase leading-none tracking-wide",
            badgeClassName
          )}
        >
          {FLIGHT_STOP_SHORT[point.stop_type]}
        </span>
      </div>
      {airport && (
        <p className="mt-0.5 break-words pl-5 text-[10px] leading-snug text-muted-foreground">
          {airport}
        </p>
      )}
    </div>
  );
}
