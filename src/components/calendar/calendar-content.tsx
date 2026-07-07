"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
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
} from "@/lib/actions/calendar";
import { EVENT_TYPE_LABELS } from "@/types/models";
import type { CalendarEvent, EventType } from "@/types/models";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CalendarContentProps {
  events: CalendarEvent[];
  isStudent: boolean;
}

export function CalendarContent({ events, isStudent }: CalendarContentProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventType, setEventType] = useState<EventType>("study");

  const eventDates = events.map((e) => new Date(e.start_date));
  const dayEvents = events.filter(
    (e) => selectedDate && isSameDay(new Date(e.start_date), selectedDate)
  );

  async function handleCreate(formData: FormData) {
    setLoading(true);
    formData.set("type", eventType);
    const result = await createEvent(formData);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Event created");
      setOpen(false);
    }
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Event</DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={eventType}
                    onValueChange={(v) => setEventType(v as EventType)}
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <Button type="submit" disabled={loading}>
                  Create Event
                </Button>
              </form>
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
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{ hasEvent: "bg-sky-100 font-bold" }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? format(selectedDate, "MMMM d, yyyy")
                : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayEvents.length > 0 ? (
              <ul className="space-y-3">
                {dayEvents.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
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
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
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
                          onClick={() =>
                            handleToggle(event.id, event.completed)
                          }
                        >
                          {event.completed ? "Undo" : "Done"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No events on this day.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
