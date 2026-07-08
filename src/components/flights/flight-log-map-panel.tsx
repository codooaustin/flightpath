"use client";

import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatHours } from "@/lib/calculations/flight-hours";
import type { FlightMapEntry } from "@/lib/flights/map-data";

const FlightRouteMap = dynamic(
  () =>
    import("@/components/flights/flight-route-map").then(
      (mod) => mod.FlightRouteMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-48 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);

interface FlightLogMapPanelProps {
  entries: FlightMapEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  mapHeightClassName?: string;
  showFlightList?: boolean;
  collapsible?: boolean;
  defaultMapCollapsed?: boolean;
}

export function FlightLogMapPanel({
  entries,
  selectedId,
  onSelect,
  mapHeightClassName = "h-48",
  showFlightList = true,
  collapsible = false,
  defaultMapCollapsed = false,
}: FlightLogMapPanelProps) {
  const selected =
    entries.find((entry) => entry.id === selectedId) ?? entries[0] ?? null;

  return (
    <div className="space-y-4">
      <FlightRouteMap
        entry={selected}
        mapHeightClassName={mapHeightClassName}
        collapsible={collapsible}
        defaultCollapsed={defaultMapCollapsed}
      />
      {selected && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{selected.routeLabel}</span>
          <span className="text-muted-foreground">
            {format(new Date(selected.date), "MMM d, yyyy")}
            {selected.aircraft ? ` · ${selected.aircraft}` : ""}
          </span>
          <Badge variant="secondary">
            {formatHours(selected.flightTime)} hrs
          </Badge>
          {selected.landings != null && (
            <Badge variant="outline">
              {selected.landings} landing{selected.landings === 1 ? "" : "s"}
            </Badge>
          )}
        </div>
      )}
      {showFlightList && entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selected?.id === entry.id
                    ? "border-sky-600 bg-sky-50/50"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{entry.routeLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                      {entry.aircraft ? ` · ${entry.aircraft}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {formatHours(entry.flightTime)} hrs
                    </Badge>
                    {entry.landings != null && (
                      <Badge variant="outline">
                        {entry.landings} landing
                        {entry.landings === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
