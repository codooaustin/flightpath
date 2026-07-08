"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlightLogMapPanel } from "@/components/flights/flight-log-map-panel";
import type { FlightMapEntry } from "@/lib/flights/map-data";
import { MapPin, Plane } from "lucide-react";

interface FlightLogCardProps {
  entries: FlightMapEntry[];
}

export function FlightLogCard({ entries }: FlightLogCardProps) {
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? null);

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
        {entries.length > 0 ? (
          <FlightLogMapPanel
            entries={entries}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
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
