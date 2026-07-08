"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EVENT_TEMPLATES,
  type EventTemplate,
} from "@/lib/calendar/event-templates";
import { eventTypeBadgeClass } from "@/lib/calendar/event-styles";
import { EVENT_TYPE_LABELS } from "@/types/models";
import type { EventType } from "@/types/models";
import { CalendarPlus, Sparkles } from "lucide-react";

interface CalendarEmptyStateProps {
  selectedDate?: Date;
  missionSuggestion?: EventTemplate | null;
  isStudent: boolean;
  onUseTemplate: (template: EventTemplate) => void;
  onAddEvent: () => void;
}

export function CalendarEmptyState({
  selectedDate,
  missionSuggestion,
  isStudent,
  onUseTemplate,
  onAddEvent,
}: CalendarEmptyStateProps) {
  if (!isStudent) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No events on this day.
      </p>
    );
  }

  const templates = missionSuggestion
    ? [
        missionSuggestion,
        ...EVENT_TEMPLATES.filter(
          (template) => template.title !== missionSuggestion.title
        ).slice(0, 2),
      ]
    : EVENT_TEMPLATES.slice(0, 3);

  return (
    <div className="space-y-4 rounded-lg border border-dashed p-4">
      <div className="space-y-1 text-center">
        <CalendarPlus className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Nothing scheduled yet</p>
        <p className="text-sm text-muted-foreground">
          {selectedDate
            ? `Add an event for ${selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}`
            : "Get started with a suggested event"}
        </p>
      </div>

      {missionSuggestion && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
            <Sparkles className="h-3.5 w-3.5" />
            Suggested from your mission
          </p>
          <Button
            variant="outline"
            className="h-auto w-full justify-start gap-2 py-2 text-left"
            onClick={() => onUseTemplate(missionSuggestion)}
          >
            <Badge
              variant="outline"
              className={eventTypeBadgeClass(missionSuggestion.type)}
            >
              {EVENT_TYPE_LABELS[missionSuggestion.type]}
            </Badge>
            <span className="font-medium">{missionSuggestion.title}</span>
          </Button>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        {templates.map((template) => (
          <Button
            key={template.title}
            variant="outline"
            className="h-auto flex-col items-start gap-1 py-3 text-left"
            onClick={() => onUseTemplate(template)}
          >
            <Badge
              variant="outline"
              className={eventTypeBadgeClass(template.type)}
            >
              {EVENT_TYPE_LABELS[template.type]}
            </Badge>
            <span className="font-medium">{template.title}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {template.description}
            </span>
          </Button>
        ))}
      </div>

      <Button className="w-full" onClick={onAddEvent}>
        Add custom event
      </Button>
    </div>
  );
}
