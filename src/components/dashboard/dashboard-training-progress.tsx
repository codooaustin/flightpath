import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import { FaaHelpTip } from "@/components/certification/faa-help-tip";
import {
  MissionStatusBadge,
  getMissionSurfaceStyles,
} from "@/components/missions/mission-status-badge";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import {
  formatAgeEligibility,
  formatTypicalHourRange,
} from "@/lib/calculations/certification";
import { getStageHourGuidance } from "@/lib/data/stage-guidance";
import type { Mission, Stage, UserMission } from "@/types/models";
import { Award, Plane, Target } from "lucide-react";

interface DashboardTrainingProgressProps {
  currentStage: Stage | null;
  stageProgress: { completed: number; total: number; percentage: number };
  nextMission: (UserMission & { mission?: Mission }) | null;
  hourTotals: FlightHourTotals;
  age: number | null;
  birthDate: string | null;
}

export function DashboardTrainingProgress({
  currentStage,
  stageProgress,
  nextMission,
  hourTotals,
  age,
  birthDate,
}: DashboardTrainingProgressProps) {
  const guidance = currentStage
    ? getStageHourGuidance(currentStage.name, hourTotals)
    : null;
  const primaryRequirement = guidance?.requirements[0] ?? null;
  const additionalRequirements = guidance?.requirements.slice(1) ?? [];
  const typicalRangeLabel = guidance?.milestone
    ? formatTypicalHourRange(guidance.milestone)
    : null;
  const hoursRemaining =
    primaryRequirement != null
      ? Math.max(0, primaryRequirement.target - primaryRequirement.current)
      : null;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5 text-sky-600" />
            Training Progress
          </span>
          <Link
            href="/logbook"
            className="text-sm font-normal text-sky-600 hover:underline"
          >
            Log a flight →
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <section className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current focus
          </p>

          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Target className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                  {currentStage?.name ?? "Getting started"}
                </p>
                {currentStage?.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {currentStage.description}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="shrink-0">
                {stageProgress.completed}/{stageProgress.total} missions
              </Badge>
            </div>

            {nextMission?.mission ? (
              <Link
                href="/missions"
                className={getMissionSurfaceStyles(
                  nextMission.status,
                  "block rounded-lg border p-2.5 transition-opacity hover:opacity-90"
                )}
              >
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Plane className="h-3.5 w-3.5 text-sky-600" />
                  Next mission
                </p>
                <p className="mt-1 font-medium leading-snug">
                  {nextMission.mission.title}
                </p>
                <div className="mt-1.5">
                  <MissionStatusBadge status={nextMission.status} />
                </div>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                All missions in this stage are landed.
              </p>
            )}
          </div>
        </section>

        {guidance && primaryRequirement ? (
          <section className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Hour goal
              </p>
              <div className="mt-1 flex items-center gap-1">
                <p className="font-semibold">{guidance.milestone.name}</p>
                {guidance.faaResource && (
                  <FaaHelpTip resource={guidance.faaResource} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {guidance.milestone.description}
              </p>
              {typicalRangeLabel && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Typical training: {typicalRangeLabel}
                  {guidance.faaMinimum != null && guidance.faaMinimum > 0
                    ? ` · FAA minimum: ${guidance.faaMinimum} hrs`
                    : ""}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-2xl font-bold">
                    {formatHours(primaryRequirement.current)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {primaryRequirement.label}
                  </p>
                </div>
                <p className="text-right text-sm font-medium">
                  {formatHours(primaryRequirement.current)} /{" "}
                  {formatHours(primaryRequirement.target)} hrs
                </p>
              </div>
              <FlightProgress value={primaryRequirement.percent} />
              {hoursRemaining != null && hoursRemaining > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatHours(hoursRemaining)} remaining to target
                </p>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Hour goal
            </p>
            <p className="text-2xl font-bold">
              {formatHours(hourTotals.total)}
            </p>
            <p className="text-sm text-muted-foreground">
              Total logged hours. Advance on the roadmap to unlock stage hour
              targets.
            </p>
          </section>
        )}

        {additionalRequirements.length > 0 && (
          <section className="space-y-3 border-t pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Additional requirements
            </p>
            {additionalRequirements.map((requirement) => (
              <div key={requirement.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {requirement.label}
                  </span>
                  <span className="font-medium">
                    {formatHours(requirement.current)} /{" "}
                    {formatHours(requirement.target)} hrs
                  </span>
                </div>
                <Progress value={requirement.percent} className="h-1.5" />
              </div>
            ))}
          </section>
        )}

        <section className="mt-auto space-y-1 border-t pt-3 text-sm">
          {age != null ? (
            <p>
              <span className="text-muted-foreground">Age: </span>
              <span className="font-medium">{age} years</span>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Add your birthday in{" "}
              <Link href="/settings" className="text-sky-600 hover:underline">
                Settings
              </Link>{" "}
              to track age requirements.
            </p>
          )}
          {guidance?.milestone && (
            <p className="text-muted-foreground">
              {formatAgeEligibility(birthDate, guidance.milestone)}
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
