"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteFlight } from "@/lib/actions/flights";
import {
  formatHours,
  sumFlightHours,
} from "@/lib/calculations/flight-hours";
import {
  FAA_RESOURCES,
  getSupplementalFaaResources,
} from "@/lib/data/faa-resources";
import { getStageResources } from "@/lib/data/stage-guidance";
import {
  DashboardFaaMobileButton,
  DashboardFaaSidebar,
} from "@/components/dashboard/dashboard-faa-sidebar";
import { FlightForm } from "@/components/logbook/flight-form";
import { LogbookHero } from "@/components/logbook/logbook-hero";
import { LogbookHourStats } from "@/components/logbook/logbook-hour-stats";
import { StageHourRequirementsCard } from "@/components/logbook/stage-hour-requirements-card";
import { FlightLogMapPanel } from "@/components/flights/flight-log-map-panel";
import { formatFlightRoute } from "@/lib/flights/route";
import { getCurrentStage } from "@/lib/calculations/progress";
import type { FlightMapEntry } from "@/lib/flights/map-data";
import type { Flight, Mission, Stage, UserMission } from "@/types/models";
import { format } from "date-fns";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LogbookContentProps {
  flights: Flight[];
  flightMapEntries: FlightMapEntry[];
  stages: Stage[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  isStudent: boolean;
  homeAirport?: string | null;
  birthDate?: string | null;
  initialOpenNew?: boolean;
}

export function LogbookContent({
  flights,
  flightMapEntries,
  stages,
  missions,
  userMissions,
  isStudent,
  homeAirport,
  birthDate = null,
  initialOpenNew = false,
}: LogbookContentProps) {
  const [open, setOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMapFlightId, setSelectedMapFlightId] = useState(
    flightMapEntries[0]?.id ?? null
  );

  const totals = sumFlightHours(flights);
  const currentStage = getCurrentStage(stages, missions, userMissions);

  const stageResources = currentStage
    ? getStageResources(currentStage.name)
    : [];
  const supplementalFaaResources = useMemo(() => {
    const base = getSupplementalFaaResources().filter(
      (resource) =>
        !stageResources.some(
          (existing) => existing.milestoneId === resource.milestoneId
        )
    );
    const hasLogbook = [...stageResources, ...base].some(
      (resource) =>
        resource.milestoneId === FAA_RESOURCES.flight_logbook.milestoneId
    );
    return hasLogbook ? base : [...base, FAA_RESOURCES.flight_logbook];
  }, [stageResources]);

  useEffect(() => {
    if (initialOpenNew && isStudent) {
      setOpen(true);
    }
  }, [initialOpenNew, isStudent]);

  function closeDialog() {
    setOpen(false);
    setEditingFlight(null);
  }

  function openLogDialog() {
    setEditingFlight(null);
    setOpen(true);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this flight entry? This cannot be undone.")) {
      return;
    }
    const result = await deleteFlight(id);
    if (result?.error) toast.error(result.error);
    else toast.success("Flight deleted");
  }

  function openEdit(flight: Flight) {
    setEditingFlight(flight);
    setOpen(true);
  }

  function formatRoute(flight: Flight) {
    return formatFlightRoute(
      flight.route,
      flight.departure_airport,
      flight.arrival_airport
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logbook</h1>
          <p className="text-muted-foreground">
            Log flights and track your hour totals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardFaaMobileButton
            resources={stageResources}
            supplemental={supplementalFaaResources}
          />
          {isStudent && (
            <Button className="lg:hidden" onClick={openLogDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Log Flight
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 lg:gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <LogbookHero
            currentStage={currentStage}
            hourTotals={totals}
            isStudent={isStudent}
            onLogFlight={openLogDialog}
          />

          <LogbookHourStats totals={totals} flightCount={flights.length} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-sky-600" />
                Flights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {flightMapEntries.length > 0 ? (
                <FlightLogMapPanel
                  entries={flightMapEntries}
                  selectedId={selectedMapFlightId}
                  onSelect={setSelectedMapFlightId}
                  mapHeightClassName="h-56"
                  showFlightList={false}
                  collapsible
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add airport codes when logging a flight to see routes on the
                  map.
                </p>
              )}

              {flights.length > 0 ? (
                <>
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Aircraft</TableHead>
                          <TableHead className="text-right">Time</TableHead>
                          {isStudent && <TableHead />}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flights.map((flight) => (
                          <TableRow
                            key={flight.id}
                            className={cn(
                              selectedMapFlightId === flight.id
                                ? "bg-sky-50/50 dark:bg-sky-950/20"
                                : "cursor-pointer"
                            )}
                            onClick={() => setSelectedMapFlightId(flight.id)}
                          >
                            <TableCell>
                              {format(new Date(flight.date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>{formatRoute(flight)}</TableCell>
                            <TableCell>
                              {[flight.aircraft, flight.tail_number]
                                .filter(Boolean)
                                .join(" ") || "—"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatHours(Number(flight.flight_time))}
                            </TableCell>
                            {isStudent && (
                              <TableCell>
                                <div
                                  className="flex justify-end gap-1"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEdit(flight)}
                                    aria-label="Edit flight"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(flight.id)}
                                    aria-label="Delete flight"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <ul className="space-y-2 md:hidden">
                    {flights.map((flight) => (
                      <li key={flight.id}>
                        <button
                          type="button"
                          className={cn(
                            "w-full rounded-lg border p-3 text-left transition-colors",
                            selectedMapFlightId === flight.id
                              ? "border-sky-600 bg-sky-50/50 dark:bg-sky-950/20"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedMapFlightId(flight.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{formatRoute(flight)}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(flight.date), "MMM d, yyyy")}
                                {flight.aircraft ? ` · ${flight.aircraft}` : ""}
                              </p>
                            </div>
                            <p className="shrink-0 font-medium">
                              {formatHours(Number(flight.flight_time))} hrs
                            </p>
                          </div>
                          {isStudent && (
                            <div
                              className="mt-2 flex justify-end gap-1"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEdit(flight)}
                                aria-label="Edit flight"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(flight.id)}
                                aria-label="Delete flight"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No flights logged yet.{" "}
                  {isStudent ? (
                    "Tap Log Flight to add your first entry."
                  ) : (
                    <Link
                      href="/dashboard"
                      className="text-sky-600 hover:underline"
                    >
                      View dashboard
                    </Link>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="hidden shrink-0 lg:flex lg:flex-col lg:gap-4">
          <div className="w-72 xl:w-80">
            <StageHourRequirementsCard
              currentStage={currentStage}
              hourTotals={totals}
              userMissions={userMissions}
              missions={missions}
              birthDate={birthDate}
            />
          </div>
          <DashboardFaaSidebar
            storageKey="flightpath-logbook-faa-sidebar"
            resources={stageResources}
            supplemental={supplementalFaaResources}
            defaultOpen={totals.total < 30}
          />
        </div>
      </div>

      {isStudent && (
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEditingFlight(null);
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFlight ? "Edit Flight" : "Log Flight"}
              </DialogTitle>
            </DialogHeader>
            <FlightForm
              key={editingFlight?.id ?? "new"}
              flight={editingFlight ?? undefined}
              homeAirport={homeAirport}
              onSuccess={closeDialog}
              loading={loading}
              setLoading={setLoading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
