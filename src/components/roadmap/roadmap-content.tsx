"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Lock,
} from "lucide-react";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import {
  DashboardFaaMobileButton,
  DashboardFaaSidebar,
} from "@/components/dashboard/dashboard-faa-sidebar";
import { MissionDetailDialog } from "@/components/missions/mission-detail-dialog";
import {
  MissionStatusBadge,
  getMissionSurfaceStyles,
  getMissionTitleStyles,
} from "@/components/missions/mission-status-badge";
import { MissionAgeNotice } from "@/components/missions/mission-age-notice";
import { RoadmapHero } from "@/components/roadmap/roadmap-hero";
import { updateMissionStatus } from "@/lib/actions/missions";
import {
  calculateStageProgress,
  getCurrentStage,
  getNextActionableMission,
  getStageStatus,
} from "@/lib/calculations/progress";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { getStageResources } from "@/lib/data/stage-guidance";
import { getSupplementalFaaResources } from "@/lib/data/faa-resources";
import type { Mission, MissionStatus, Stage, UserMission } from "@/types/models";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/calculations/costs";
import { toast } from "sonner";

interface RoadmapContentProps {
  stages: Stage[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  birthDate: string | null;
  isStudent: boolean;
  hourTotals: FlightHourTotals;
}

export function RoadmapContent({
  stages,
  missions,
  userMissions,
  birthDate,
  isStudent,
  hourTotals,
}: RoadmapContentProps) {
  const currentStage = getCurrentStage(stages, missions, userMissions);
  const [expandedStage, setExpandedStage] = useState<string | null>(
    () => currentStage?.id ?? null
  );
  const [selected, setSelected] = useState<
    (UserMission & { mission?: Mission }) | null
  >(null);
  const [loading, setLoading] = useState(false);

  const stageProgress = currentStage
    ? calculateStageProgress(currentStage, missions, userMissions)
    : { completed: 0, total: 0, percentage: 0 };
  const nextMission = getNextActionableMission(
    userMissions,
    missions,
    birthDate,
    stages
  );

  const stageResources = currentStage
    ? getStageResources(currentStage.name)
    : [];
  const supplementalFaaResources = getSupplementalFaaResources().filter(
    (resource) =>
      !stageResources.some(
        (existing) => existing.milestoneId === resource.milestoneId
      )
  );

  async function handleStatusChange(status: MissionStatus) {
    if (!selected) return;
    setLoading(true);
    const result = await updateMissionStatus(selected.id, status);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Mission updated");
      setSelected(null);
    }
  }

  function openNextMission() {
    if (nextMission) {
      setSelected(nextMission);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Career Roadmap</h1>
          <p className="text-muted-foreground">
            Your path from first flight to airline captain
          </p>
        </div>
        <DashboardFaaMobileButton
          resources={stageResources}
          supplemental={supplementalFaaResources}
        />
      </div>

      <div className="flex gap-4 lg:gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <RoadmapHero
            currentStage={currentStage}
            stageProgress={stageProgress}
            nextMission={nextMission}
            hourTotals={hourTotals}
            onNextMissionClick={openNextMission}
          />

          <div className="relative space-y-4">
            {stages.map((stage, index) => {
              const status = getStageStatus(stage, currentStage);
              const progress = calculateStageProgress(
                stage,
                missions,
                userMissions
              );
              const stageMissions = missions.filter(
                (mission) => mission.stage_id === stage.id
              );
              const isExpanded = expandedStage === stage.id;
              const landedLabel = `${progress.completed}/${progress.total} landed`;

              return (
                <div key={stage.id} className="relative flex gap-4">
                  {index < stages.length - 1 && (
                    <div className="absolute left-[19px] top-10 h-[calc(100%+8px)] w-0.5 bg-border" />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                      status === "completed" &&
                        "border-green-500 bg-green-50 text-green-600 dark:bg-green-950/30",
                      status === "current" &&
                        "border-sky-500 bg-sky-50 text-sky-600 dark:bg-sky-950/30",
                      status === "locked" &&
                        "border-muted bg-muted text-muted-foreground"
                    )}
                  >
                    {status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : status === "current" ? (
                      <Circle className="h-5 w-5" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                  <Card
                    className={cn(
                      "flex-1",
                      status === "current" && "border-sky-200 dark:border-sky-800"
                    )}
                  >
                    <CardHeader
                      className="cursor-pointer pb-2"
                      onClick={() =>
                        setExpandedStage(isExpanded ? null : stage.id)
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-lg">{stage.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              status === "completed"
                                ? "default"
                                : status === "current"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {progress.percentage}%
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stage.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stageMissions.length} mission
                        {stageMissions.length === 1 ? "" : "s"} · {landedLabel}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {status === "current" ? (
                        <FlightProgress value={progress.percentage} />
                      ) : (
                        <Progress
                          value={progress.percentage}
                          className={cn(
                            "h-1.5",
                            status === "completed" && "[&>div]:bg-green-600",
                            status === "locked" && "opacity-60"
                          )}
                        />
                      )}
                      {isExpanded && (
                        <ul className="space-y-2">
                          {stageMissions.map((mission) => {
                            const um = userMissions.find(
                              (entry) => entry.mission_id === mission.id
                            );
                            const missionStatus = um?.status ?? "locked";

                            return (
                              <li
                                key={mission.id}
                                className={getMissionSurfaceStyles(
                                  missionStatus,
                                  "cursor-pointer space-y-2 rounded-lg border p-3 transition-shadow hover:shadow-sm"
                                )}
                                onClick={() => um && setSelected(um)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <p
                                      className={getMissionTitleStyles(
                                        missionStatus,
                                        "font-medium"
                                      )}
                                    >
                                      {mission.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {mission.estimated_duration}
                                      {mission.estimated_cost
                                        ? ` · ${formatCurrency(Number(mission.estimated_cost))}`
                                        : ""}
                                    </p>
                                  </div>
                                  <MissionStatusBadge status={missionStatus} />
                                </div>
                                <MissionAgeNotice
                                  birthDate={birthDate}
                                  mission={mission}
                                  missions={missions}
                                  userMissions={userMissions}
                                  className="text-xs text-amber-700 dark:text-amber-300"
                                />
                              </li>
                            );
                          })}
                          {stageMissions.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              Missions coming soon for this stage.
                            </p>
                          )}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        <DashboardFaaSidebar
          storageKey="flightpath-roadmap-faa-sidebar"
          resources={stageResources}
          supplemental={supplementalFaaResources}
          defaultOpen={hourTotals.total < 30}
        />
      </div>

      <MissionDetailDialog
        selected={selected}
        missions={missions}
        birthDate={birthDate}
        userMissions={userMissions}
        isStudent={isStudent}
        loading={loading}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
