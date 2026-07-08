import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import {
  MissionStatusBadge,
  getMissionSurfaceStyles,
} from "@/components/missions/mission-status-badge";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import { getStageTrainingDisplay } from "@/lib/data/stage-guidance";
import type { Mission, Stage, UserMission } from "@/types/models";
import { Plane, Target } from "lucide-react";

interface RoadmapHeroProps {
  currentStage: Stage | null;
  stageProgress: { completed: number; total: number; percentage: number };
  nextMission: (UserMission & { mission?: Mission }) | null;
  hourTotals: FlightHourTotals;
  onNextMissionClick: () => void;
}

export function RoadmapHero({
  currentStage,
  stageProgress,
  nextMission,
  hourTotals,
  onNextMissionClick,
}: RoadmapHeroProps) {
  const trainingDisplay = currentStage
    ? getStageTrainingDisplay(currentStage.name, hourTotals)
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5 text-sky-600" />
              Current Stage
            </span>
            <Link
              href="/dashboard"
              className="text-sm font-normal text-sky-600 hover:underline"
            >
              Dashboard →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-semibold">
                {currentStage?.name ?? "Getting Started"}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {currentStage?.description}
              </p>
            </div>
            <Badge variant="secondary">{stageProgress.percentage}%</Badge>
          </div>
          <FlightProgress value={stageProgress.percentage} />
          <p className="text-sm text-muted-foreground">
            {stageProgress.completed} of {stageProgress.total} missions landed
          </p>
        </CardContent>
      </Card>

      <Card
        className={getMissionSurfaceStyles(
          nextMission?.status ?? "locked",
          "cursor-pointer transition-shadow hover:shadow-md"
        )}
        onClick={onNextMissionClick}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-600" />
            Next Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextMission?.mission ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold">{nextMission.mission.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {nextMission.mission.description}
              </p>
              <MissionStatusBadge status={nextMission.status} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              All current missions landed — great work!
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span>Training Snapshot</span>
            <Link
              href="/logbook"
              className="text-sm font-normal text-sky-600 hover:underline"
            >
              Logbook →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {trainingDisplay?.certificate && (
            <div>
              <p className="font-medium text-muted-foreground">
                {trainingDisplay.certificate.sectionTitle}
              </p>
              <p className="mt-0.5">{trainingDisplay.certificate.name}</p>
            </div>
          )}
          {trainingDisplay?.hourAccrual && (
            <div>
              <p className="font-medium text-muted-foreground">
                {trainingDisplay.hourAccrual.sectionTitle}
              </p>
              <p className="mt-0.5">
                {formatHours(trainingDisplay.hourAccrual.primary.current)} /{" "}
                {formatHours(trainingDisplay.hourAccrual.primary.target)} hrs
              </p>
              {trainingDisplay.hourAccrual.note && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {trainingDisplay.hourAccrual.note}
                </p>
              )}
            </div>
          )}
          {!trainingDisplay && (
            <p className="text-muted-foreground">
              Log flights to track hour progress for this stage.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
