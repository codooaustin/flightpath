import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, DollarSign, BookOpen, Plane, Award } from "lucide-react";
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
import {
  formatHours,
  sumFlightHours,
} from "@/lib/calculations/flight-hours";
import {
  formatAgeEligibility,
  getAge,
  getCareerMarker,
  getInstrumentRequirementProgress,
  getMilestoneHourTarget,
  getMilestoneProgress,
  getNextHourAchievement,
  getNextMilestone,
} from "@/lib/calculations/certification";
import {
  FAA_RESOURCES,
  getFaaResource,
  getRelevantFaaResources,
  getSupplementalFaaResources,
} from "@/lib/data/faa-resources";
import {
  FaaGuidancePanel,
  FaaHelpTip,
  FaaResourceLinks,
} from "@/components/certification/faa-help-tip";
import { FlightLogCard } from "@/components/dashboard/flight-log-card";
import type { FlightMapEntry } from "@/lib/flights/map-data";
import { EVENT_TYPE_LABELS } from "@/types/models";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import type {
  CalendarEvent,
  Expense,
  Flight,
  JournalEntry,
  Mission,
  Profile,
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
  flights: Flight[];
  studentProfile: Profile | null;
  flightMapEntries: FlightMapEntry[];
}

export function DashboardContent({
  stages,
  missions,
  userMissions,
  events,
  expenses,
  journal,
  flights,
  studentProfile,
  flightMapEntries,
}: DashboardContentProps) {
  const progress = calculateProgress(userMissions);
  const currentStage = getCurrentStage(stages, missions, userMissions);
  const nextMission = getNextMission(userMissions);
  const totalSpent = calculateTotalSpent(expenses);
  const estimatedRemaining = calculateEstimatedRemaining(missions, userMissions);

  const hourTotals = sumFlightHours(flights);
  const nextMilestone = getNextMilestone(hourTotals.total);
  const nextAchievement = getNextHourAchievement(hourTotals.total);
  const careerMarker = getCareerMarker(hourTotals.total);
  const milestoneTarget = nextMilestone
    ? getMilestoneHourTarget(nextMilestone)
    : null;
  const milestoneProgress = nextMilestone
    ? getMilestoneProgress(hourTotals.total, nextMilestone)
    : 0;
  const instrumentProgress = nextMilestone
    ? getInstrumentRequirementProgress(hourTotals, nextMilestone)
    : null;
  const age = studentProfile?.birth_date
    ? getAge(studentProfile.birth_date)
    : null;
  const faaResources = getRelevantFaaResources(
    hourTotals.total,
    nextMilestone?.id ?? null
  );
  const supplementalFaaResources = getSupplementalFaaResources().filter(
    (resource) =>
      !faaResources.some((existing) => existing.milestoneId === resource.milestoneId)
  );
  const nextMilestoneResource = nextMilestone
    ? getFaaResource(nextMilestone.id)
    : null;

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
              {progress.completed} of {progress.total} missions landed
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

        <Link href="/missions" className="group block">
          <Card className="h-full cursor-pointer transition-shadow group-hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-sky-600" />
                  Next Mission
                </span>
                <span className="text-sm font-normal text-sky-600 group-hover:underline">
                  View missions →
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextMission?.mission ? (
                <div className="space-y-2">
                  <p className="font-medium">{nextMission.mission.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {nextMission.mission.description}
                  </p>
                  <MissionStatusBadge status={nextMission.status} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All missions landed!
                </p>
              )}
            </CardContent>
          </Card>
        </Link>

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

        <FlightLogCard entries={flightMapEntries} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky-600" />
              Flight Hours
              <FaaHelpTip resource={FAA_RESOURCES.flight_logbook} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">
                {formatHours(hourTotals.total)}
              </p>
              <p className="text-sm text-muted-foreground">Total logged hours</p>
            </div>
            {nextMilestone && milestoneTarget != null ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Next: {nextMilestone.name}
                  </span>
                  <span className="font-medium">
                    {formatHours(hourTotals.total)} / {milestoneTarget} hrs
                  </span>
                </div>
                <Progress value={milestoneProgress} className="h-2" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                All tracked certification hour targets met.
              </p>
            )}
            {nextAchievement && (
              <Badge variant="secondary">
                {nextAchievement.target} hrs —{" "}
                {formatHours(nextAchievement.remaining)} to go
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              {careerMarker.current.name}
              {careerMarker.next
                ? ` · Next: ${careerMarker.next.name}`
                : ""}
            </p>
            <Link
              href="/logbook"
              className="text-sm font-medium text-sky-600 hover:underline"
            >
              Log a flight →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-sky-600" />
              Certification & Age
              <FaaHelpTip resource={FAA_RESOURCES.age_requirements} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {age != null ? (
              <p className="text-sm">
                <span className="text-muted-foreground">Age: </span>
                <span className="font-medium">{age} years</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add your birthday in{" "}
                <Link href="/settings" className="text-sky-600 hover:underline">
                  Settings
                </Link>{" "}
                to track age requirements.
              </p>
            )}
            {nextMilestone ? (
              <>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-medium">{nextMilestone.name}</p>
                    {nextMilestoneResource && (
                      <FaaHelpTip resource={nextMilestoneResource} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {nextMilestone.description}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatAgeEligibility(
                    studentProfile?.birth_date ?? null,
                    nextMilestone
                  )}
                </p>
                {instrumentProgress && (
                  <div className="space-y-2 border-t pt-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Instrument hours</span>
                        <span>
                          {formatHours(instrumentProgress.instrument.current)} /{" "}
                          {instrumentProgress.instrument.target}
                        </span>
                      </div>
                      <Progress
                        value={instrumentProgress.instrument.percent}
                        className="h-1.5"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>PIC cross-country (approx.)</span>
                        <span>
                          {formatHours(instrumentProgress.crossCountryPic.current)}{" "}
                          / {instrumentProgress.crossCountryPic.target}
                        </span>
                      </div>
                      <Progress
                        value={instrumentProgress.crossCountryPic.percent}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No remaining hour-based certification targets.
              </p>
            )}
            <FaaGuidancePanel resources={faaResources} />
            <FaaResourceLinks resources={supplementalFaaResources} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
