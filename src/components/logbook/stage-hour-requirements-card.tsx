"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FaaHelpTip } from "@/components/certification/faa-help-tip";
import { StageResourceLinks } from "@/components/missions/stage-resource-links";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import { getStageHourGuidance } from "@/lib/data/stage-guidance";
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
  const guidance = currentStage
    ? getStageHourGuidance(currentStage.name, hourTotals)
    : null;

  return (
    <Card className="lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-5 w-5 text-sky-600" />
          Stage Hour Requirements
        </CardTitle>
        {currentStage && (
          <p className="text-sm text-muted-foreground">{currentStage.name}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentStage || !guidance ? (
          <p className="text-sm text-muted-foreground">
            Complete roadmap missions to unlock stage-specific hour guidance.
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <p className="font-medium">{guidance.milestone.name}</p>
                {guidance.faaResource && (
                  <FaaHelpTip resource={guidance.faaResource} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {guidance.milestone.description}
              </p>
              {guidance.typicalRange.length >= 2 && (
                <p className="text-xs text-muted-foreground">
                  Typical range: {guidance.typicalRange[0]}–
                  {guidance.typicalRange[1]} hrs
                </p>
              )}
            </div>

            <div className="space-y-3">
              {guidance.requirements.map((requirement) => (
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
