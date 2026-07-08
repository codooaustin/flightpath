"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import { FaaHelpTip } from "@/components/certification/faa-help-tip";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import {
  getMissionAgeBlockMessage,
  isMissionBlockedByAge,
} from "@/lib/missions/mission-eligibility";
import {
  getStageCertificateMissionStatus,
  getStageTrainingDisplay,
} from "@/lib/data/stage-guidance";
import type { Mission, Stage, UserMission } from "@/types/models";
import { Award } from "lucide-react";

interface StageHourRequirementsCardProps {
  currentStage: Stage | null;
  hourTotals: FlightHourTotals;
  userMissions: (UserMission & { mission?: Mission })[];
  missions: Mission[];
  birthDate: string | null;
}

export function StageHourRequirementsCard({
  currentStage,
  hourTotals,
  userMissions,
  missions,
  birthDate,
}: StageHourRequirementsCardProps) {
  const display = currentStage
    ? getStageTrainingDisplay(currentStage.name, hourTotals)
    : null;
  const certificateMission = currentStage
    ? getStageCertificateMissionStatus(currentStage.name, userMissions)
    : null;
  const certificateMissionRecord = missions.find(
    (mission) => mission.title === display?.certificate?.relatedMissionTitle
  );
  const certificateAgeBlocked =
    certificateMissionRecord != null &&
    isMissionBlockedByAge(
      birthDate,
      certificateMissionRecord,
      missions,
      userMissions
    );

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
              <div className="space-y-2">
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
                {certificateMission && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <MissionStatusBadge status={certificateMission.status} />
                      {certificateMission.status !== "completed" &&
                        !certificateAgeBlocked &&
                        certificateMissionRecord && (
                          <Link
                            href={`/missions?open=${certificateMissionRecord.id}`}
                            className="text-xs font-medium text-sky-600 hover:underline"
                          >
                            Complete mission →
                          </Link>
                        )}
                    </div>
                    {certificateAgeBlocked && certificateMissionRecord && (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {getMissionAgeBlockMessage(
                          birthDate,
                          certificateMissionRecord.title
                        )}
                      </p>
                    )}
                  </div>
                )}
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
                  <p className="font-medium">{display.milestone.name}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {display.hourAccrual.primary.label}
                    </span>
                    <span className="font-medium">
                      {formatHours(display.hourAccrual.primary.current)} /{" "}
                      {formatHours(display.hourAccrual.primary.target)} hrs
                    </span>
                  </div>
                  <FlightProgress value={display.hourAccrual.primary.percent} />
                  {display.hourAccrual.note && (
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
