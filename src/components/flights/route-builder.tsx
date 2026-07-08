"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FLIGHT_STOP_LABELS,
  defaultTrainingRoute,
  getFlightRoute,
  type FlightRouteStop,
  type FlightStopType,
} from "@/lib/flights/route";
import type { Flight } from "@/types/models";
import { Plus, Trash2 } from "lucide-react";

const STOP_TYPES: FlightStopType[] = [
  "departure",
  "touch_and_go",
  "full_stop",
  "landing",
];

interface RouteBuilderProps {
  flight?: Flight;
  homeAirport?: string | null;
}

export function RouteBuilder({ flight, homeAirport }: RouteBuilderProps) {
  const initial = getFlightRoute(
    flight?.route ?? null,
    flight?.departure_airport ?? null,
    flight?.arrival_airport ?? null
  );

  const [stops, setStops] = useState<FlightRouteStop[]>(
    initial.length > 0 ? initial : defaultTrainingRoute(homeAirport)
  );

  function updateStop(index: number, patch: Partial<FlightRouteStop>) {
    setStops((current) =>
      current.map((stop, i) => (i === index ? { ...stop, ...patch } : stop))
    );
  }

  function addStop() {
    setStops((current) => {
      const last = current[current.length - 1];
      return [
        ...current,
        {
          airport: last?.airport ?? homeAirport ?? "",
          stop_type: "touch_and_go",
        },
      ];
    });
  }

  function removeStop(index: number) {
    setStops((current) => current.filter((_, i) => i !== index));
  }

  function applyRoundTripPattern() {
    const base = (homeAirport ?? stops[0]?.airport ?? "").toUpperCase();
    if (!base) return;
    setStops([
      { airport: base, stop_type: "departure" },
      { airport: base, stop_type: "landing" },
    ]);
  }

  function applyTouchAndGoPattern() {
    const base = (homeAirport ?? stops[0]?.airport ?? "").toUpperCase();
    if (!base) return;
    const practice =
      stops.find((stop) => stop.stop_type === "touch_and_go")?.airport ||
      stops.find((stop) => stop.airport && stop.airport !== base)?.airport ||
      "";
    setStops([
      { airport: base, stop_type: "departure" },
      { airport: practice, stop_type: "touch_and_go" },
      { airport: base, stop_type: "landing" },
    ]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>Route</Label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={applyRoundTripPattern}>
            Same airport
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyTouchAndGoPattern}
          >
            Touch &amp; go pattern
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {stops.map((stop, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={stop.airport}
              onChange={(e) =>
                updateStop(index, { airport: e.target.value.toUpperCase() })
              }
              placeholder={index === 0 ? "KLVJ" : "GLS"}
              className="flex-1"
              aria-label={`Airport stop ${index + 1}`}
            />
            <Select
              value={stop.stop_type}
              onValueChange={(value) =>
                updateStop(index, { stop_type: value as FlightStopType })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STOP_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {FLIGHT_STOP_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeStop(index)}
              disabled={stops.length <= 2}
              aria-label="Remove stop"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addStop}>
        <Plus className="mr-2 h-4 w-4" />
        Add stop
      </Button>

      <input type="hidden" name="route" value={JSON.stringify(stops)} />
      <p className="text-xs text-muted-foreground">
        Example: depart KLVJ, touch &amp; go at GLS, land KLVJ — 1.0 hr, 2 landings.
      </p>
    </div>
  );
}
