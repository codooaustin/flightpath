"use client";

import { Button } from "@/components/ui/button";
import {
  JOURNAL_TEMPLATES,
  type JournalTemplate,
} from "@/lib/journal/entry-templates";
import { BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATE_BUTTON_CLASS =
  "h-auto min-w-0 w-full shrink whitespace-normal flex-col items-stretch gap-1 py-3 text-left";

interface JournalEmptyStateProps {
  missionSuggestion?: JournalTemplate | null;
  isStudent: boolean;
  onUseTemplate: (template: JournalTemplate) => void;
  onNewEntry: () => void;
}

export function JournalEmptyState({
  missionSuggestion,
  isStudent,
  onUseTemplate,
  onNewEntry,
}: JournalEmptyStateProps) {
  if (!isStudent) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No journal entries yet.
      </p>
    );
  }

  const templates = missionSuggestion
    ? JOURNAL_TEMPLATES.slice(0, 3)
    : JOURNAL_TEMPLATES;

  return (
    <div className="space-y-4 rounded-lg border border-dashed p-4">
      <div className="space-y-1 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Start your aviation journal</p>
        <p className="text-sm text-muted-foreground">
          Document training days, milestones, and lessons learned.
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
            className={TEMPLATE_BUTTON_CLASS}
            onClick={() => onUseTemplate(missionSuggestion)}
          >
            <span className="font-medium leading-snug">{missionSuggestion.title}</span>
            <span className="text-xs leading-snug font-normal text-muted-foreground">
              {missionSuggestion.description}
            </span>
          </Button>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        {templates.map((template) => (
          <Button
            key={template.title}
            variant="outline"
            className={TEMPLATE_BUTTON_CLASS}
            onClick={() => onUseTemplate(template)}
          >
            <span className="font-medium leading-snug">{template.title}</span>
            <span
              className={cn(
                "text-xs leading-snug font-normal text-muted-foreground",
                "line-clamp-3"
              )}
            >
              {template.description}
            </span>
          </Button>
        ))}
      </div>

      <Button className="w-full" onClick={onNewEntry}>
        Write a custom entry
      </Button>
    </div>
  );
}
