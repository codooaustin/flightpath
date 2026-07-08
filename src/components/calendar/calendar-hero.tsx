"use client";

import Link from "next/link";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eventTypeBadgeClass } from "@/lib/calendar/event-styles";
import { EVENT_TYPE_LABELS } from "@/types/models";
import type { CalendarEvent, EventType } from "@/types/models";
import { Calendar, Plus } from "lucide-react";

interface CalendarHeroProps {
  nextEvent: CalendarEvent | null;
  isStudent: boolean;
  onAddEvent: () => void;
}

export function CalendarHero({
  nextEvent,
  isStudent,
  onAddEvent,
}: CalendarHeroProps) {
  const eventDate = nextEvent ? new Date(nextEvent.start_date) : null;
  const isOverdue =
    nextEvent && eventDate && !nextEvent.completed && isPast(eventDate);

  return (
    <Card className="border-sky-200 dark:border-sky-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-600" />
            {nextEvent ? "Up Next" : "Your Schedule"}
          </span>
          <Link
            href="/missions"
            className="text-sm font-normal text-sky-600 hover:underline"
          >
            View missions →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end justify-between gap-4">
        {nextEvent && eventDate ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-semibold leading-snug">
                {nextEvent.title}
              </p>
              <Badge
                variant="outline"
                className={eventTypeBadgeClass(nextEvent.type as EventType)}
              >
                {EVENT_TYPE_LABELS[nextEvent.type as EventType]}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="font-normal">
                  Overdue
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {format(eventDate, "EEEE, MMM d · h:mm a")}
              {!isOverdue && (
                <span className="ml-2 text-sky-700 dark:text-sky-300">
                  ({formatDistanceToNow(eventDate, { addSuffix: true })})
                </span>
              )}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium">No upcoming events</p>
            <p className="text-sm text-muted-foreground">
              Schedule flights, study blocks, and training milestones.
            </p>
          </div>
        )}
        {isStudent && (
          <Button onClick={onAddEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
