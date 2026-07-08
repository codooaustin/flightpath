"use client";

import { useMemo, useState } from "react";
import { format, isSameDay, isSameMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createEvent,
  deleteEvent,
  toggleEventComplete,
  updateEvent,
} from "@/lib/actions/calendar";
import { EVENT_TYPE_LABELS } from "@/types/models";
import type { CalendarEvent, EventType } from "@/types/models";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CalendarContentProps {
  events: CalendarEvent[];
  isStudent: boolean;
}

function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function EventForm({
  event,
  eventType,
  setEventType,
  defaultStartDate,
  loading,
  setLoading,
  onSuccess,
}: {
  event?: CalendarEvent;
  eventType: EventType;
  setEventType: (type: EventType) => void;
  defaultStartDate?: Date;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}) {
  const defaultStart =
    event?.start_date ??
    (defaultStartDate
      ? toDatetimeLocalValue(
          new Date(
            defaultStartDate.getFullYear(),
            defaultStartDate.getMonth(),
            defaultStartDate.getDate(),
            9,
            0
          ).toISOString()
        )
      : "");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("type", eventType);
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
          defaultValue={event?.title ?? ""}
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
            <SelectValue />
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
      <div className="space-y-2">
        <Label htmlFor="start_date">Start date</Label>
        <Input
          id="start_date"
          name="start_date"
          type="datetime-local"
          defaultValue={defaultStart}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={event?.description ?? ""}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {event ? "Save Changes" : "Create Event"}
      </Button>
    </form>
  );
}

function EventListItem({
  event,
  isStudent,
  isSelectedDay,
  onEdit,
  onDelete,
  onToggle,
}: {
  event: CalendarEvent;
  isStudent: boolean;
  isSelectedDay: boolean;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
}) {
  return (
    <li
      className={`flex items-start justify-between rounded-lg border p-3 ${
        isSelectedDay ? "border-sky-300 bg-sky-50/40" : ""
      }`}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={
              event.completed
                ? "font-medium line-through opacity-60"
                : "font-medium"
            }
          >
            {event.title}
          </p>
          <Badge variant="outline">
            {EVENT_TYPE_LABELS[event.type as EventType]}
          </Badge>
        </div>
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {format(new Date(event.start_date), "h:mm a")}
        </p>
      </div>
      {isStudent && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(event.id, event.completed)}
          >
            {event.completed ? "Undo" : "Done"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(event)}
            aria-label={`Edit ${event.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(event.id)}
            aria-label={`Delete ${event.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </li>
  );
}

export function CalendarContent({ events, isStudent }: CalendarContentProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState<EventType>("study");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const eventDates = events.map((event) => new Date(event.start_date));

  const monthEvents = useMemo(
    () =>
      events
        .filter((event) =>
          isSameMonth(new Date(event.start_date), visibleMonth)
        )
        .sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        ),
    [events, visibleMonth]
  );

  const groupedMonthEvents = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();

    for (const event of monthEvents) {
      const key = format(new Date(event.start_date), "yyyy-MM-dd");
      const dayEvents = groups.get(key) ?? [];
      dayEvents.push(event);
      groups.set(key, dayEvents);
    }

    return [...groups.entries()].sort(([left], [right]) =>
      left.localeCompare(right)
    );
  }, [monthEvents]);

  function handleDialogChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEditingEvent(null);
      setEventType("study");
    }
  }

  function openCreate() {
    setEditingEvent(null);
    setEventType("study");
    setOpen(true);
  }

  function openEdit(event: CalendarEvent) {
    setEditingEvent(event);
    setEventType(event.type);
    setOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteEvent(id);
    if (result?.error) toast.error(result.error);
    else toast.success("Event deleted");
  }

  async function handleToggle(id: string, completed: boolean) {
    const result = await toggleEventComplete(id, !completed);
    if (result?.error) toast.error(result.error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Plan flights, study sessions, and milestones
          </p>
        </div>
        {isStudent && (
          <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger
              render={
                <Button onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? "Edit Event" : "New Event"}
                </DialogTitle>
              </DialogHeader>
              <EventForm
                key={editingEvent?.id ?? "new"}
                event={editingEvent ?? undefined}
                eventType={eventType}
                setEventType={setEventType}
                defaultStartDate={selectedDate}
                loading={loading}
                setLoading={setLoading}
                onSuccess={() => handleDialogChange(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="flex justify-center p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{ hasEvent: "bg-sky-100 font-bold" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{format(visibleMonth, "MMMM yyyy")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {monthEvents.length === 0
                ? "No events this month"
                : `${monthEvents.length} event${monthEvents.length === 1 ? "" : "s"} this month`}
              {selectedDate &&
                ` · ${format(selectedDate, "MMM d")} selected`}
            </p>
          </CardHeader>
          <CardContent>
            {groupedMonthEvents.length > 0 ? (
              <div className="space-y-4">
                {groupedMonthEvents.map(([dayKey, dayEvents]) => {
                  const dayDate = new Date(`${dayKey}T12:00:00`);
                  const isSelectedDay =
                    !!selectedDate && isSameDay(dayDate, selectedDate);

                  return (
                    <section key={dayKey} className="space-y-2">
                      <h3
                        className={`text-sm font-medium ${
                          isSelectedDay ? "text-sky-700" : "text-muted-foreground"
                        }`}
                      >
                        {format(dayDate, "EEEE, MMMM d")}
                      </h3>
                      <ul className="space-y-2">
                        {dayEvents.map((event) => (
                          <EventListItem
                            key={event.id}
                            event={event}
                            isStudent={isStudent}
                            isSelectedDay={isSelectedDay}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            onToggle={handleToggle}
                          />
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No events scheduled for {format(visibleMonth, "MMMM yyyy")}.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
