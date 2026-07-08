import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import { FaaHelpTip } from "@/components/certification/faa-help-tip";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import { formatAgeEligibility } from "@/lib/calculations/certification";
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

interface DashboardTrainingProgressProps {
  currentStage: Stage | null;
  hourTotals: FlightHourTotals;
  age: number | null;
  birthDate: string | null;
  userMissions: (UserMission & { mission?: Mission })[];
  missions: Mission[];
}

export function DashboardTrainingProgress({
  currentStage,
  hourTotals,
  age,
  birthDate,
  userMissions,
  missions,
}: DashboardTrainingProgressProps) {
  const display = currentStage
    ? getStageTrainingDisplay(currentStage.name, hourTotals)
    : null;
  const certificateMission = currentStage
    ? getStageCertificateMissionStatus(currentStage.name, userMissions)
    : null;
  const hourAccrual = display?.hourAccrual ?? null;
  const hoursRemaining =
    hourAccrual != null
      ? Math.max(0, hourAccrual.primary.target - hourAccrual.primary.current)
      : null;

  const certificateCompleted = certificateMission?.status === "completed";
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
  const showAgeEligibility =
    display?.milestone &&
    !(display.certificate && certificateCompleted) &&
    !certificateAgeBlocked;

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
        {display?.certificate && (
          <section className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {display.certificate.sectionTitle}
            </p>
            <div>
              <div className="flex items-center gap-1">
                <p className="font-semibold">{display.certificate.name}</p>
                {display.certificate.faaResource && (
                  <FaaHelpTip resource={display.certificate.faaResource} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {display.certificate.description}
              </p>
            </div>
            {certificateMission ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <MissionStatusBadge status={certificateMission.status} />
                  {certificateMission.status !== "completed" &&
                    !certificateAgeBlocked && (
                      <Link
                        href="/missions"
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
                {!certificateAgeBlocked &&
                  certificateMission.status === "locked" &&
                  !certificateCompleted && (
                    <p className="text-xs text-muted-foreground">
                      Complete medical exam and ground school missions first.
                      You can keep logging flight hours in the meantime.
                    </p>
                  )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Track this on the{" "}
                <Link href="/missions" className="text-sky-600 hover:underline">
                  Missions
                </Link>{" "}
                page when you receive your certificate.
              </p>
            )}
          </section>
        )}

        {hourAccrual ? (
          <section
            className={
              display?.certificate ? "space-y-3 border-t pt-4" : "space-y-3"
            }
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {hourAccrual.sectionTitle}
              </p>
              {!display?.certificate && (
                <div className="mt-1 flex items-center gap-1">
                  <p className="font-semibold">{display?.milestone.name}</p>
                </div>
              )}
              {hourAccrual.note && !display?.certificate && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {hourAccrual.note}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-2xl font-bold">
                    {formatHours(hourAccrual.primary.current)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hourAccrual.primary.label}
                  </p>
                </div>
                <p className="text-right text-sm font-medium">
                  {formatHours(hourAccrual.primary.current)} /{" "}
                  {formatHours(hourAccrual.primary.target)} hrs
                </p>
              </div>
              <FlightProgress value={hourAccrual.primary.percent} />
              {hourAccrual.note && display?.certificate ? (
                <p className="text-xs text-muted-foreground">{hourAccrual.note}</p>
              ) : (
                hoursRemaining != null &&
                hoursRemaining > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatHours(hoursRemaining)} remaining to target
                  </p>
                )
              )}
            </div>

            {hourAccrual.additional.length > 0 && (
              <div className="space-y-3 border-t pt-3">
                {hourAccrual.additional.map((requirement) => (
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
              </div>
            )}
          </section>
        ) : !display ? (
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
        ) : null}

        <section className="mt-auto space-y-1 border-t pt-3 text-sm">
          {birthDate ? (
            <>
              {age != null && (
                <p>
                  <span className="text-muted-foreground">Age: </span>
                  <span className="font-medium">{age} years</span>
                </p>
              )}
              {showAgeEligibility && display?.milestone && (
                <p className="text-muted-foreground">
                  {formatAgeEligibility(birthDate, display.milestone)}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              Add your birthday in{" "}
              <Link href="/settings" className="text-sky-600 hover:underline">
                Settings
              </Link>{" "}
              to track age requirements.
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
