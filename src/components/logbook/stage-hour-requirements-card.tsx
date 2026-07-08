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
            {display.certificate && (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {display.certificate.sectionTitle}
                </p>
                <div className="flex items-center gap-1">
                  <p className="font-medium">{display.certificate.name}</p>
                  {display.certificate.faaResource && (
                    <FaaHelpTip resource={display.certificate.faaResource} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {display.certificate.description}
                </p>
              </div>
            )}

            {display.hourAccrual && (
              <div
                className={
                  display.certificate ? "space-y-3 border-t pt-4" : "space-y-3"
                }
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {display.hourAccrual.sectionTitle}
                </p>
                {!display.certificate && (
                  <div className="flex items-center gap-1">
                    <p className="font-medium">{display.milestone.name}</p>
                  </div>
                )}
                {!display.certificate && display.hourAccrual.note && (
                  <p className="text-xs text-muted-foreground">
                    {display.hourAccrual.note}
                  </p>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {display.hourAccrual.primary.label}
                    </span>
                    <span className="font-medium">
                      {formatHours(display.hourAccrual.primary.current)} /{" "}
                      {formatHours(display.hourAccrual.primary.target)} hrs
                    </span>
                  </div>
                  <Progress
                    value={display.hourAccrual.primary.percent}
                    className="h-1.5"
                  />
                  {display.certificate && display.hourAccrual.note && (
                    <p className="text-xs text-muted-foreground">
                      {display.hourAccrual.note}
                    </p>
                  )}
                </div>

                {display.hourAccrual.additional.map((requirement) => (
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
