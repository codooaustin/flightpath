"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlightRoutePath } from "@/components/flights/flight-route-path";
import { formatHours } from "@/lib/calculations/flight-hours";
import { formatDateOnly } from "@/lib/dates";
import type { FlightMapEntry } from "@/lib/flights/map-data";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plane,
} from "lucide-react";

const FlightRouteMap = dynamic(
  () =>
    import("@/components/flights/flight-route-map").then(
      (mod) => mod.FlightRouteMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-52 items-center justify-center bg-muted/30 text-sm text-muted-foreground">
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
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-sky-600" />
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

      <CardContent className="flex flex-1 flex-col p-0">
        {current ? (
          <>
            <div className="relative bg-sky-50/40">
              <FlightRouteMap
                entry={current}
                mapHeightClassName="h-52"
                className="rounded-none border-0 border-b"
              />

              {hasMultiple && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => setIndex((i) => i + 1)}
                    disabled={!canGoOlder}
                    aria-label="Older flight"
                    className={cn(
                      "absolute left-2 top-1/2 z-10 -translate-y-1/2 shadow-md",
                      "bg-background/90 backdrop-blur-sm hover:bg-background"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => setIndex((i) => i - 1)}
                    disabled={!canGoNewer}
                    aria-label="More recent flight"
                    className={cn(
                      "absolute right-2 top-1/2 z-10 -translate-y-1/2 shadow-md",
                      "bg-background/90 backdrop-blur-sm hover:bg-background"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
                    <Badge
                      variant="secondary"
                      className="bg-background/90 text-xs shadow-sm backdrop-blur-sm"
                    >
                      {index + 1} of {entries.length}
                      {index === 0 ? " · Latest" : ""}
                    </Badge>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3 px-4 py-4">
              <FlightRoutePath stops={current.stops} />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDateOnly(current.date)}
                  </span>
                  {current.aircraft && (
                    <span className="inline-flex items-center gap-1.5">
                      <Plane className="h-3.5 w-3.5" />
                      {current.aircraft}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
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
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-10 text-center">
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
