import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import { FaaHelpTip } from "@/components/certification/faa-help-tip";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import { formatAgeEligibility } from "@/lib/calculations/certification";
import { getStageTrainingDisplay } from "@/lib/data/stage-guidance";
import type { Stage } from "@/types/models";
import { Award } from "lucide-react";

interface DashboardTrainingProgressProps {
  currentStage: Stage | null;
  hourTotals: FlightHourTotals;
  age: number | null;
  birthDate: string | null;
}

export function DashboardTrainingProgress({
  currentStage,
  hourTotals,
  age,
  birthDate,
}: DashboardTrainingProgressProps) {
  const display = currentStage
    ? getStageTrainingDisplay(currentStage.name, hourTotals)
    : null;
  const primaryRequirement = display?.primaryRequirement ?? null;
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
        {display ? (
          <section className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {display.sectionTitle}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <p className="font-semibold">{display.headline}</p>
                {display.faaResource && (
                  <FaaHelpTip resource={display.faaResource} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {display.description}
              </p>
              {display.contextualNote && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {display.contextualNote}
                </p>
              )}
            </div>

            {primaryRequirement ? (
              <div className="space-y-2">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatHours(primaryRequirement.current)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {display.mode === "certificate"
                        ? "Hours logged toward early training"
                        : primaryRequirement.label}
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
                    {formatHours(hoursRemaining)}{" "}
                    {display.mode === "certificate"
                      ? "remaining to typical early training range"
                      : "remaining to target"}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {formatHours(display.hoursLogged)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total hours logged
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Training
            </p>
            <p className="text-2xl font-bold">
              {formatHours(hourTotals.total)}
            </p>
            <p className="text-sm text-muted-foreground">
              Total logged hours. Advance on the roadmap to unlock stage
              guidance.
            </p>
          </section>
        )}

        {display && display.additionalRequirements.length > 0 && (
          <section className="space-y-3 border-t pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Additional requirements
            </p>
            {display.additionalRequirements.map((requirement) => (
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
          {display?.milestone && (
            <p className="text-muted-foreground">
              {formatAgeEligibility(birthDate, display.milestone)}
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
