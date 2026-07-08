"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHours } from "@/lib/calculations/flight-hours";
import type { FlightMapEntry } from "@/lib/flights/map-data";
import { MapPin, Plane } from "lucide-react";

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

interface FlightLogCardProps {
  entries: FlightMapEntry[];
}

export function FlightLogCard({ entries }: FlightLogCardProps) {
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? null);
  const selected =
    entries.find((entry) => entry.id === selectedId) ?? entries[0] ?? null;

  return (
    <Card className="md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-sky-600" />
            Flight Log
          </span>
          <Link href="/logbook" className="text-sm font-normal text-sky-600 hover:underline">
            View logbook →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length > 0 ? (
          <>
            <FlightRouteMap entry={selected} />
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(entry.id)}
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
                            {entry.landings} landing{entry.landings === 1 ? "" : "s"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
            <Plane className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No flights logged yet.
            </p>
            <Link href="/logbook" className="text-sm font-medium text-sky-600 hover:underline">
              Log your first flight →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
