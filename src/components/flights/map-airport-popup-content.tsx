import type { FlightMapPoint } from "@/lib/flights/map-data";
import {
  formatAirportName,
  getStopDisplay,
} from "@/lib/flights/stop-display";
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

  return (
    <div className="min-w-[200px] max-w-[260px] p-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            iconClassName
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-mono text-base font-bold tracking-wide leading-none">
            {point.code}
          </p>
          {point.name && (
            <p className="text-xs leading-snug text-muted-foreground">
              {formatAirportName(point.name)}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2.5 border-t pt-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
            badgeClassName
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
