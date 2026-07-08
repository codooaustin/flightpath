"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { eventTypeBadgeClass } from "@/lib/calendar/event-styles";
import { EVENT_TYPE_LABELS } from "@/types/models";
import type { CalendarEvent, EventType } from "@/types/models";
import { Clock, Pencil, Trash2 } from "lucide-react";

interface CalendarEventDetailDialogProps {
  event: CalendarEvent | null;
  isStudent: boolean;
  loading: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onToggleComplete: (event: CalendarEvent) => void;
}

function formatEventTimeRange(event: CalendarEvent): string {
  const start = new Date(event.start_date);
  const startLabel = format(start, "EEEE, MMM d · h:mm a");

  if (!event.end_date) {
    return startLabel;
  }

  const end = new Date(event.end_date);
  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${format(start, "EEEE, MMM d")} · ${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;
  }

  return `${startLabel} – ${format(end, "h:mm a")}`;
}

export function CalendarEventDetailDialog({
  event,
  isStudent,
  loading,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
}: CalendarEventDetailDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2 pr-6">
            <DialogTitle
              className={
                event.completed ? "line-through opacity-70" : undefined
              }
            >
              {event.title}
            </DialogTitle>
            <Badge
              variant="outline"
              className={eventTypeBadgeClass(event.type as EventType)}
            >
              {EVENT_TYPE_LABELS[event.type as EventType]}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {formatEventTimeRange(event)}
          </div>
          {event.completed && (
            <Badge variant="secondary" className="w-fit font-normal">
              Completed
            </Badge>
          )}
        </DialogHeader>

        {event.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}

        {isStudent && (
          <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={event.completed ? "outline" : "default"}
                onClick={() => onToggleComplete(event)}
                disabled={loading}
              >
                {event.completed ? "Mark incomplete" : "Mark complete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onEdit(event)}
                disabled={loading}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => onDelete(event)}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
