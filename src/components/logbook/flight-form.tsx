"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFlight, updateFlight } from "@/lib/actions/flights";
import { LOGBOOK_FIELD_HELP } from "@/lib/data/faa-resources";
import { FieldHelpTip } from "@/components/certification/faa-help-tip";
import { RouteBuilder } from "@/components/flights/route-builder";
import type { Flight } from "@/types/models";
import { toast } from "sonner";

function LabelWithHelp({
  htmlFor,
  children,
  fieldKey,
}: {
  htmlFor: string;
  children: ReactNode;
  fieldKey?: keyof typeof LOGBOOK_FIELD_HELP;
}) {
  const help = fieldKey ? LOGBOOK_FIELD_HELP[fieldKey] : null;
  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor}>{children}</Label>
      {help && <FieldHelpTip label={help.label} tip={help.tip} />}
    </div>
  );
}

interface FlightFormProps {
  flight?: Flight;
  homeAirport?: string | null;
  onSuccess: () => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

export function FlightForm({
  flight,
  homeAirport,
  onSuccess,
  loading,
  setLoading,
}: FlightFormProps) {
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
          <LabelWithHelp htmlFor="flight_time" fieldKey="flight_time">
            Flight Time (hrs)
          </LabelWithHelp>
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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="instructor">Instructor</Label>
          <Input
            id="instructor"
            name="instructor"
            defaultValue={flight?.instructor ?? ""}
          />
        </div>
      </div>

      <RouteBuilder flight={flight} homeAirport={homeAirport} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <LabelWithHelp htmlFor="pic_time" fieldKey="pic_time">
            Pilot in Command
          </LabelWithHelp>
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
          <LabelWithHelp htmlFor="dual_time" fieldKey="dual_time">
            Dual Instruction
          </LabelWithHelp>
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
          <LabelWithHelp htmlFor="cross_country_time" fieldKey="cross_country_time">
            Cross-Country
          </LabelWithHelp>
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
          <LabelWithHelp htmlFor="night_time" fieldKey="night_time">
            Night Time
          </LabelWithHelp>
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
          <LabelWithHelp htmlFor="instrument_time" fieldKey="instrument_time">
            Instrument Time
          </LabelWithHelp>
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
