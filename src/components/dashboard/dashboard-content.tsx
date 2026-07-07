import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, DollarSign, BookOpen } from "lucide-react";
import {
  calculateProgress,
  getCurrentStage,
  getNextMission,
} from "@/lib/calculations/progress";
import {
  calculateTotalSpent,
  calculateEstimatedRemaining,
  formatCurrency,
} from "@/lib/calculations/costs";
import { EVENT_TYPE_LABELS } from "@/types/models";
import type {
  CalendarEvent,
  Expense,
  JournalEntry,
  Mission,
  Stage,
  UserMission,
} from "@/types/models";
import { format } from "date-fns";

interface DashboardContentProps {
  stages: Stage[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  events: CalendarEvent[];
  expenses: Expense[];
  journal: JournalEntry[];
}

export function DashboardContent({
  stages,
  missions,
  userMissions,
  events,
  expenses,
  journal,
}: DashboardContentProps) {
  const progress = calculateProgress(userMissions);
  const currentStage = getCurrentStage(stages, missions, userMissions);
  const nextMission = getNextMission(userMissions);
  const totalSpent = calculateTotalSpent(expenses);
  const estimatedRemaining = calculateEstimatedRemaining(missions, userMissions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your aviation journey at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-sky-600" />
              Current Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {currentStage?.name ?? "Getting Started"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentStage?.description}
                </p>
              </div>
              <Badge variant="secondary">{progress.percentage}% complete</Badge>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {progress.completed} of {progress.total} missions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-sky-600" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-sky-600" />
              Next Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextMission?.mission ? (
              <div className="space-y-2">
                <p className="font-medium">{nextMission.mission.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {nextMission.mission.description}
                </p>
                <Badge>{nextMission.status.replace("_", " ")}</Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                All missions completed!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-600" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <ul className="space-y-3">
                {events.map((event) => (
                  <li key={event.id} className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.start_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="outline">
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
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-600" />
              Recent Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {journal.length > 0 ? (
              <div>
                <p className="font-medium">{journal[0].title}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                  {journal[0].content}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {format(new Date(journal[0].entry_date), "MMM d, yyyy")}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No journal entries yet. Start capturing your journey.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
