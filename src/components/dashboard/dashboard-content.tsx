import {
  calculateProgress,
  getCurrentStage,
  getNextMission,
} from "@/lib/calculations/progress";
import {
  calculateTotalSpent,
  calculateEstimatedRemaining,
} from "@/lib/calculations/costs";
import { sumFlightHours } from "@/lib/calculations/flight-hours";
import {
  getAge,
  getCareerMarker,
  getInstrumentRequirementProgress,
  getMilestoneHourTarget,
  getMilestoneProgress,
  getNextHourAchievement,
  getNextMilestone,
} from "@/lib/calculations/certification";
import {
  getRelevantFaaResources,
  getSupplementalFaaResources,
} from "@/lib/data/faa-resources";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardActivityGrid } from "@/components/dashboard/dashboard-activity-grid";
import { DashboardTrainingProgress } from "@/components/dashboard/dashboard-training-progress";
import { FlightLogCard } from "@/components/dashboard/flight-log-card";
import {
  DashboardFaaMobileButton,
  DashboardFaaSidebar,
} from "@/components/dashboard/dashboard-faa-sidebar";
import type { FlightMapEntry } from "@/lib/flights/map-data";
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

interface DashboardContentProps {
  stages: Stage[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  events: CalendarEvent[];
  expenses: Expense[];
  journal: JournalEntry[];
  flights: Flight[];
  flightMapEntries: FlightMapEntry[];
  studentProfile: Profile | null;
}

export function DashboardContent({
  stages,
  missions,
  userMissions,
  events,
  expenses,
  journal,
  flights,
  flightMapEntries,
  studentProfile,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your aviation journey at a glance
          </p>
        </div>
        <DashboardFaaMobileButton
          resources={faaResources}
          supplemental={supplementalFaaResources}
        />
      </div>

      <div className="flex gap-4 lg:gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <DashboardHero
            currentStage={currentStage}
            progress={progress}
            nextMission={nextMission}
          />

          <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
            <DashboardTrainingProgress
              totalHours={hourTotals.total}
              nextMilestone={nextMilestone}
              milestoneTarget={milestoneTarget}
              milestoneProgress={milestoneProgress}
              nextAchievement={nextAchievement}
              careerMarker={careerMarker}
              age={age}
              birthDate={studentProfile?.birth_date ?? null}
              instrumentProgress={instrumentProgress}
            />
            <FlightLogCard entries={flightMapEntries} />
          </div>

          <DashboardActivityGrid
            events={events}
            journal={journal}
            totalSpent={totalSpent}
            estimatedRemaining={estimatedRemaining}
          />
        </div>

        <DashboardFaaSidebar
          resources={faaResources}
          supplemental={supplementalFaaResources}
          defaultOpen={hourTotals.total < 30}
        />
      </div>
    </div>
  );
}
