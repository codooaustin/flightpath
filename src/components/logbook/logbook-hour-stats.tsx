"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import { ChevronDown, ChevronUp, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogbookHourStatsProps {
  totals: FlightHourTotals;
  flightCount: number;
}

const primaryStats = [
  { key: "total" as const, label: "Total Hours" },
  { key: "pic" as const, label: "PIC" },
  { key: "dual" as const, label: "Dual" },
  { key: "crossCountry" as const, label: "Cross-Country" },
];

const secondaryStats = [
  { key: "night" as const, label: "Night" },
  { key: "instrument" as const, label: "Instrument" },
  { key: "landings" as const, label: "Landings", isCount: true },
];

export function LogbookHourStats({ totals, flightCount }: LogbookHourStatsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {primaryStats.map(({ key, label }) => (
          <Card key={key} className="p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{formatHours(totals[key])}</p>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2 text-muted-foreground"
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        All categories
      </Button>

      <div
        className={cn(
          "grid gap-3 overflow-hidden transition-all sm:grid-cols-2 lg:grid-cols-4",
          expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {secondaryStats.map(({ key, label, isCount }) => (
          <Card key={key} className="p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">
              {isCount ? totals.landings : formatHours(totals[key])}
            </p>
          </Card>
        ))}
        <Card className="p-3">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Plane className="h-3.5 w-3.5 text-sky-600" />
            Flights
          </p>
          <p className="text-lg font-semibold">{flightCount}</p>
        </Card>
      </div>
    </div>
  );
}
