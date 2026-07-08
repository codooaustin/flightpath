"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FaaHelpTip } from "@/components/certification/faa-help-tip";
import { StageResourceLinks } from "@/components/missions/stage-resource-links";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import { getStageTrainingDisplay } from "@/lib/data/stage-guidance";
import type { Stage } from "@/types/models";
import { Award } from "lucide-react";

interface StageHourRequirementsCardProps {
  currentStage: Stage | null;
  hourTotals: FlightHourTotals;
}

export function StageHourRequirementsCard({
  currentStage,
  hourTotals,
}: StageHourRequirementsCardProps) {
  const display = currentStage
    ? getStageTrainingDisplay(currentStage.name, hourTotals)
    : null;

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-5 w-5 text-sky-600" />
          Stage Requirements
        </CardTitle>
        {currentStage && (
          <p className="text-sm text-muted-foreground">{currentStage.name}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentStage || !display ? (
          <p className="text-sm text-muted-foreground">
            Complete roadmap missions to unlock stage-specific guidance.
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <p className="font-medium">{display.headline}</p>
                {display.faaResource && (
                  <FaaHelpTip resource={display.faaResource} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {display.description}
              </p>
              {display.contextualNote && display.mode !== "certificate" && (
                <p className="text-xs text-muted-foreground">
                  {display.contextualNote}
                </p>
              )}
            </div>

            {display.primaryRequirement ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {display.mode === "certificate"
                        ? "Hours logged toward early training"
                        : display.primaryRequirement.label}
                    </span>
                    <span className="font-medium">
                      {formatHours(display.primaryRequirement.current)} /{" "}
                      {formatHours(display.primaryRequirement.target)} hrs
                    </span>
                  </div>
                  <Progress
                    value={display.primaryRequirement.percent}
                    className="h-1.5"
                  />
                  {display.mode === "certificate" && display.contextualNote && (
                    <p className="text-xs text-muted-foreground">
                      {display.contextualNote}
                    </p>
                  )}
                </div>
                {display.additionalRequirements.map((requirement) => (
                  <div key={requirement.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
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

            <StageResourceLinks stageName={currentStage.name} />

            <Link
              href="/roadmap"
              className="inline-block text-sm font-medium text-sky-600 hover:underline"
            >
              View career roadmap →
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
