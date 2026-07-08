import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/calculations/costs";
import { formatDateOnly } from "@/lib/dates";
import { EVENT_TYPE_LABELS } from "@/types/models";
import type { CalendarEvent, JournalEntry } from "@/types/models";
import { BookOpen, Calendar, DollarSign } from "lucide-react";

interface DashboardActivityGridProps {
  events: CalendarEvent[];
  journal: JournalEntry[];
  totalSpent: number;
  estimatedRemaining: number;
}

export function DashboardActivityGrid({
  events,
  journal,
  totalSpent,
  estimatedRemaining,
}: DashboardActivityGridProps) {
  const recentJournal = journal[0];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-600" />
              Upcoming Events
            </span>
            <Link
              href="/calendar"
              className="text-sm font-normal text-sky-600 hover:underline"
            >
              View calendar →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <ul className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <li
                  key={event.id}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateOnly(event.start_date)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {EVENT_TYPE_LABELS[event.type]}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming events. Add one on the Calendar.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-600" />
              Recent Journal
            </span>
            <Link
              href="/journal"
              className="text-sm font-normal text-sky-600 hover:underline"
            >
              View journal →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentJournal ? (
            <div>
              <p className="font-medium">{recentJournal.title}</p>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                {recentJournal.content}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDateOnly(recentJournal.entry_date)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No journal entries yet. Start capturing your journey.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-sky-600" />
              Cost Summary
            </span>
            <Link
              href="/costs"
              className="text-sm font-normal text-sky-600 hover:underline"
            >
              View costs →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated remaining</p>
            <p className="text-lg font-semibold">
              {formatCurrency(estimatedRemaining)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
