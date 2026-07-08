"use client";

import Link from "next/link";
import { differenceInDays, format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { JournalEntry } from "@/types/models";
import { BookOpen, Plus } from "lucide-react";

interface JournalHeroProps {
  recentEntry: JournalEntry | null;
  entryCount: number;
  isStudent: boolean;
  onNewEntry: () => void;
}

export function JournalHero({
  recentEntry,
  entryCount,
  isStudent,
  onNewEntry,
}: JournalHeroProps) {
  const daysSinceLast =
    recentEntry != null
      ? differenceInDays(new Date(), new Date(recentEntry.entry_date))
      : null;

  return (
    <Card className="border-sky-200 dark:border-sky-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-600" />
            {recentEntry ? "Latest Entry" : "Your Journal"}
          </span>
          <Link
            href="/roadmap"
            className="text-sm font-normal text-sky-600 hover:underline"
          >
            View roadmap →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end justify-between gap-4">
        {recentEntry ? (
          <div className="min-w-0 space-y-2">
            <p className="text-xl font-semibold leading-snug">
              {recentEntry.title}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {recentEntry.content}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(recentEntry.entry_date), "MMMM d, yyyy")}
              <span className="ml-2 text-sky-700 dark:text-sky-300">
                (
                {formatDistanceToNow(new Date(recentEntry.entry_date), {
                  addSuffix: true,
                })}
                )
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {entryCount} {entryCount === 1 ? "entry" : "entries"} total
              {daysSinceLast != null && daysSinceLast > 0 && (
                <span> · {daysSinceLast} days since last entry</span>
              )}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium">No entries yet</p>
            <p className="text-sm text-muted-foreground">
              Capture lessons, milestones, and reflections from your training.
            </p>
          </div>
        )}
        {isStudent && (
          <Button onClick={onNewEntry}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
