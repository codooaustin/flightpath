"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatHours } from "@/lib/calculations/flight-hours";
import { formatFlightRoute } from "@/lib/flights/route";
import type { Flight } from "@/types/models";
import { MapPin, Plane } from "lucide-react";

interface FlightLogCardProps {
  flights: Flight[];
}

export function FlightLogCard({ flights }: FlightLogCardProps) {
  const recent = flights.slice(0, 5);

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
      <CardContent>
        {recent.length > 0 ? (
          <ul className="space-y-2">
            {recent.map((flight) => (
              <li
                key={flight.id}
                className="rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {formatFlightRoute(
                        flight.route,
                        flight.departure_airport,
                        flight.arrival_airport
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(flight.date), "MMM d, yyyy")}
                      {flight.aircraft ? ` · ${flight.aircraft}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {formatHours(Number(flight.flight_time))} hrs
                    </Badge>
                    {flight.landings != null && (
                      <Badge variant="outline">
                        {flight.landings} landing{flight.landings === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
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
