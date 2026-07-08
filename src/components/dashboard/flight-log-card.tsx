"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatHours } from "@/lib/calculations/flight-hours";
import { formatDateOnly } from "@/lib/dates";
import type { FlightMapEntry } from "@/lib/flights/map-data";
import { ChevronLeft, ChevronRight, MapPin, Plane } from "lucide-react";

const FlightRouteMap = dynamic(
  () =>
    import("@/components/flights/flight-route-map").then(
      (mod) => mod.FlightRouteMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);

interface FlightLogCardProps {
  entries: FlightMapEntry[];
}

export function FlightLogCard({ entries }: FlightLogCardProps) {
  const [index, setIndex] = useState(0);
  const current = entries[index] ?? null;
  const hasMultiple = entries.length > 1;
  const canGoNewer = index > 0;
  const canGoOlder = index < entries.length - 1;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-sky-600" />
            Flight Log
          </span>
          <Link
            href="/logbook"
            className="text-sm font-normal text-sky-600 hover:underline"
          >
            View logbook →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {current ? (
          <div className="flex flex-1 flex-col space-y-3">
            {hasMultiple && (
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setIndex((i) => i - 1)}
                  disabled={!canGoNewer}
                  aria-label="Newer flight"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  {index + 1} of {entries.length}
                  {index === 0 ? " · Latest" : ""}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setIndex((i) => i + 1)}
                  disabled={!canGoOlder}
                  aria-label="Older flight"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            <FlightRouteMap entry={current} mapHeightClassName="h-40" />

            <div className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{current.routeLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateOnly(current.date)}
                    {current.aircraft ? ` · ${current.aircraft}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Badge variant="secondary">
                    {formatHours(current.flightTime)} hrs
                  </Badge>
                  {current.landings != null && (
                    <Badge variant="outline">
                      {current.landings} landing
                      {current.landings === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
            <Plane className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No flights logged yet.
            </p>
            <Link
              href="/logbook"
              className="text-sm font-medium text-sky-600 hover:underline"
            >
              Log your first flight →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
