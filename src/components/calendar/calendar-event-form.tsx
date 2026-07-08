"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEvent, updateEvent } from "@/lib/actions/calendar";
import { EVENT_TYPE_LABELS } from "@/types/models";
import type { CalendarEvent, EventType } from "@/types/models";
import { toast } from "sonner";

const DURATION_OPTIONS = [
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "3 hours", minutes: 180 },
] as const;

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultStartForDate(date: Date): string {
  return toDatetimeLocalValue(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      9,
      0
    ).toISOString()
  );
}

function addMinutesToLocalValue(localValue: string, minutes: number): string {
  const start = new Date(localValue);
  if (Number.isNaN(start.getTime())) return "";
  start.setMinutes(start.getMinutes() + minutes);
  return toDatetimeLocalValue(start.toISOString());
}

interface CalendarEventFormProps {
  event?: CalendarEvent;
  eventType: EventType;
  setEventType: (type: EventType) => void;
  defaultStartDate?: Date;
  defaultTitle?: string;
  defaultDescription?: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

export function CalendarEventForm({
  event,
  eventType,
  setEventType,
  defaultStartDate,
  defaultTitle,
  defaultDescription,
  loading,
  setLoading,
  onSuccess,
}: CalendarEventFormProps) {
  const initialStart =
    event?.start_date ??
    (defaultStartDate ? defaultStartForDate(defaultStartDate) : "");
  const initialEnd = event?.end_date
    ? toDatetimeLocalValue(event.end_date)
    : initialStart
      ? addMinutesToLocalValue(initialStart, 60)
      : "";

  const [startValue, setStartValue] = useState(initialStart);
  const [endValue, setEndValue] = useState(initialEnd);

  function applyDuration(minutes: number) {
    if (!startValue) return;
    setEndValue(addMinutesToLocalValue(startValue, minutes));
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("type", eventType);
    formData.set("start_date", startValue);
    if (endValue) {
      formData.set("end_date", endValue);
    }
    if (event) {
      formData.set("completed", event.completed ? "true" : "false");
    }

    const result = event
      ? await updateEvent(event.id, formData)
      : await createEvent(formData);

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(event ? "Event updated" : "Event created");
    onSuccess();
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={event?.title ?? defaultTitle ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={eventType}
          onValueChange={(value) => setEventType(value as EventType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type">
              {EVENT_TYPE_LABELS[eventType]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start</Label>
          <Input
            id="start_date"
            name="start_date"
            type="datetime-local"
            value={startValue}
            onChange={(e) => setStartValue(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">Local time</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End</Label>
          <Input
            id="end_date"
            name="end_date"
            type="datetime-local"
            value={endValue}
            onChange={(e) => setEndValue(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {DURATION_OPTIONS.map((option) => (
          <Button
            key={option.minutes}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyDuration(option.minutes)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={event?.description ?? defaultDescription ?? ""}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {event ? "Save Changes" : "Create Event"}
      </Button>
    </form>
  );
}
