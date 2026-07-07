"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createFlight,
  deleteFlight,
  updateFlight,
} from "@/lib/actions/flights";
import {
  formatHours,
  sumFlightHours,
} from "@/lib/calculations/flight-hours";
import type { Flight } from "@/types/models";
import { format } from "date-fns";
import { Pencil, Plane, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface LogbookContentProps {
  flights: Flight[];
  isStudent: boolean;
}

function FlightForm({
  flight,
  onSuccess,
  loading,
  setLoading,
}: {
  flight?: Flight;
  onSuccess: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = flight
      ? await updateFlight(flight.id, formData)
      : await createFlight(formData);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success(flight ? "Flight updated" : "Flight logged");
      onSuccess();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={
              flight?.date ?? new Date().toISOString().split("T")[0]
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flight_time">Flight Time (hrs)</Label>
          <Input
            id="flight_time"
            name="flight_time"
            type="number"
            step="0.1"
            min="0"
            defaultValue={flight?.flight_time ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aircraft">Aircraft</Label>
          <Input
            id="aircraft"
            name="aircraft"
            placeholder="Cessna 172"
            defaultValue={flight?.aircraft ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tail_number">Tail Number</Label>
          <Input
            id="tail_number"
            name="tail_number"
            placeholder="N12345"
            defaultValue={flight?.tail_number ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departure_airport">Departure</Label>
          <Input
            id="departure_airport"
            name="departure_airport"
            placeholder="KORD"
            defaultValue={flight?.departure_airport ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrival_airport">Arrival</Label>
          <Input
            id="arrival_airport"
            name="arrival_airport"
            placeholder="KMDW"
            defaultValue={flight?.arrival_airport ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="instructor">Instructor</Label>
          <Input
            id="instructor"
            name="instructor"
            defaultValue={flight?.instructor ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="pic_time">PIC Time</Label>
          <Input
            id="pic_time"
            name="pic_time"
            type="number"
            step="0.1"
            min="0"
            defaultValue={flight?.pic_time ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dual_time">Dual Time</Label>
          <Input
            id="dual_time"
            name="dual_time"
            type="number"
            step="0.1"
            min="0"
            defaultValue={flight?.dual_time ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cross_country_time">Cross-Country</Label>
          <Input
            id="cross_country_time"
            name="cross_country_time"
            type="number"
            step="0.1"
            min="0"
            defaultValue={flight?.cross_country_time ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="night_time">Night Time</Label>
          <Input
            id="night_time"
            name="night_time"
            type="number"
            step="0.1"
            min="0"
            defaultValue={flight?.night_time ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instrument_time">Instrument Time</Label>
          <Input
            id="instrument_time"
            name="instrument_time"
            type="number"
            step="0.1"
            min="0"
            defaultValue={flight?.instrument_time ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="landings">Landings</Label>
          <Input
            id="landings"
            name="landings"
            type="number"
            min="0"
            step="1"
            defaultValue={flight?.landings ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={flight?.notes ?? ""} />
      </div>

      <Button type="submit" disabled={loading}>
        {flight ? "Save Changes" : "Log Flight"}
      </Button>
    </form>
  );
}

export function LogbookContent({ flights, isStudent }: LogbookContentProps) {
  const [open, setOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(false);

  const totals = sumFlightHours(flights);

  function closeDialog() {
    setOpen(false);
    setEditingFlight(null);
  }

  async function handleDelete(id: string) {
    const result = await deleteFlight(id);
    if (result?.error) toast.error(result.error);
    else toast.success("Flight deleted");
  }

  function openEdit(flight: Flight) {
    setEditingFlight(flight);
    setOpen(true);
  }

  function formatRoute(flight: Flight) {
    if (flight.departure_airport && flight.arrival_airport) {
      return `${flight.departure_airport} → ${flight.arrival_airport}`;
    }
    return flight.departure_airport ?? flight.arrival_airport ?? "—";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logbook</h1>
          <p className="text-muted-foreground">
            Log flights and track your hour totals
          </p>
        </div>
        {isStudent && (
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) setEditingFlight(null);
            }}
          >
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Flight
                </Button>
              }
            />
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFlight ? "Edit Flight" : "Log Flight"}
                </DialogTitle>
              </DialogHeader>
              <FlightForm
                key={editingFlight?.id ?? "new"}
                flight={editingFlight ?? undefined}
                onSuccess={closeDialog}
                loading={loading}
                setLoading={setLoading}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatHours(totals.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">PIC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatHours(totals.pic)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatHours(totals.dual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cross-Country</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatHours(totals.crossCountry)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Night</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatHours(totals.night)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Instrument</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatHours(totals.instrument)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Landings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totals.landings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Plane className="h-4 w-4 text-sky-600" />
              Flights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{flights.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flight History</CardTitle>
        </CardHeader>
        <CardContent>
          {flights.length > 0 ? (
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
                  <TableRow key={flight.id}>
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
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(flight)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(flight.id)}
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
          ) : (
            <p className="text-sm text-muted-foreground">
              No flights logged yet.{" "}
              {isStudent ? (
                "Tap Log Flight to add your first entry."
              ) : (
                <Link href="/dashboard" className="text-sky-600 hover:underline">
                  View dashboard
                </Link>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
