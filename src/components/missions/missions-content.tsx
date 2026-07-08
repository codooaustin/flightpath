"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import {
  DashboardFaaMobileButton,
  DashboardFaaSidebar,
} from "@/components/dashboard/dashboard-faa-sidebar";
import { MissionsHero } from "@/components/missions/missions-hero";
import { MissionDetailDialog } from "@/components/missions/mission-detail-dialog";
import {
  MissionStatusBadge,
  getMissionSurfaceStyles,
  getMissionTitleStyles,
  getStageSurfaceStyles,
  stageBadgeStyles,
} from "@/components/missions/mission-status-badge";
import { MissionAgeNotice } from "@/components/missions/mission-age-notice";
import { updateMissionStatus } from "@/lib/actions/missions";
import {
  calculateStageProgress,
  getCurrentStage,
  getNextActionableMission,
  getStageStatus,
} from "@/lib/calculations/progress";
import { formatCurrency } from "@/lib/calculations/costs";
import { getStageResources } from "@/lib/data/stage-guidance";
import { getSupplementalFaaResources } from "@/lib/data/faa-resources";
import type { Mission, MissionStatus, Stage, UserMission } from "@/types/models";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type StatusFilter = "active" | "all" | "landed" | "locked";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "all", label: "All" },
  { value: "landed", label: "Landed" },
  { value: "locked", label: "Locked" },
];

interface MissionsContentProps {
  stages: Stage[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  birthDate: string | null;
  isStudent: boolean;
  initialOpenMissionId?: string | null;
}

function matchesStatusFilter(
  status: MissionStatus,
  filter: StatusFilter,
  stageId: string | undefined,
  currentStageId: string | undefined
): boolean {
  switch (filter) {
    case "active":
      return (
        (status === "in_progress" || status === "available") &&
        stageId === currentStageId
      );
    case "landed":
      return status === "completed";
    case "locked":
      return status === "locked";
    default:
      return true;
  }
}

export function MissionsContent({
  stages,
  missions,
  userMissions,
  birthDate,
  isStudent,
  initialOpenMissionId,
}: MissionsContentProps) {
  const searchParams = useSearchParams();
  const currentStage = getCurrentStage(stages, missions, userMissions);
  const nextMission = getNextActionableMission(
    userMissions,
    missions,
    birthDate,
    stages
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const view = searchParams.get("view");
    if (view === "all" || view === "landed" || view === "locked") return view;
    return "active";
  });
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    () => new Set(currentStage?.id ? [currentStage.id] : [])
  );
  const [selected, setSelected] = useState<
    (UserMission & { mission?: Mission }) | null
  >(null);
  const [loading, setLoading] = useState(false);

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.order_number - b.order_number),
    [stages]
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

  useEffect(() => {
    if (!initialOpenMissionId) return;
    const match = userMissions.find((um) => um.mission_id === initialOpenMissionId);
    if (match) setSelected(match);
  }, [initialOpenMissionId, userMissions]);

  async function handleStatusChange(
    status: MissionStatus,
    mission: (UserMission & { mission?: Mission }) | null = selected
  ) {
    if (!mission) return;
    setLoading(true);
    const result = await updateMissionStatus(mission.id, status);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Mission updated");
      if (selected?.id === mission.id) {
        setSelected(null);
      }
    }
  }

  function toggleStage(stageId: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }

  function openMission(um: UserMission & { mission?: Mission }) {
    setSelected(um);
  }

  function handleMissionKeyDown(
    event: React.KeyboardEvent,
    um: UserMission & { mission?: Mission }
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMission(um);
    }
  }

  const visibleStages =
    statusFilter === "active" && currentStage
      ? sortedStages.filter((stage) => stage.id === currentStage.id)
      : sortedStages;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Missions</h1>
          <p className="text-muted-foreground">
            Complete missions to advance your aviation career
          </p>
        </div>
        <DashboardFaaMobileButton
          resources={stageResources}
          supplemental={supplementalFaaResources}
        />
      </div>

      <div className="flex gap-4 lg:gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <MissionsHero
            nextMission={nextMission}
            birthDate={birthDate}
            isStudent={isStudent}
            loading={loading}
            onOpenDetails={() => nextMission && setSelected(nextMission)}
            onStatusChange={(status) => handleStatusChange(status, nextMission)}
          />

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={statusFilter === value ? "default" : "outline"}
                onClick={() => setStatusFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {visibleStages.map((stage) => {
              const stageStatus = getStageStatus(stage, currentStage);
              const progress = calculateStageProgress(
                stage,
                missions,
                userMissions
              );
              const stageMissions = missions
                .filter((mission) => mission.stage_id === stage.id)
                .sort((a, b) => a.order_number - b.order_number);

              const stageUserMissions = stageMissions
                .map((mission) =>
                  userMissions.find((um) => um.mission_id === mission.id)
                )
                .filter(
                  (um): um is UserMission & { mission?: Mission } =>
                    um != null &&
                    matchesStatusFilter(
                      um.status,
                      statusFilter,
                      um.mission?.stage_id,
                      currentStage?.id
                    )
                );

              if (stageUserMissions.length === 0) return null;

              const isExpanded = expandedStages.has(stage.id);
              const landedLabel = `${progress.completed}/${progress.total} landed`;

              return (
                <Card
                  key={stage.id}
                  className={getStageSurfaceStyles(stageStatus, "transition-shadow")}
                >
                  <CardHeader
                    className="cursor-pointer pb-2"
                    onClick={() => toggleStage(stage.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{stage.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={stageBadgeStyles[stageStatus]}
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
                  {isExpanded && (
                    <CardContent className="space-y-3">
                      {stageStatus === "current" ? (
                        <FlightProgress value={progress.percentage} />
                      ) : (
                        <Progress
                          value={progress.percentage}
                          className={cn(
                            "h-1.5",
                            stageStatus === "completed" && "[&>div]:bg-green-600",
                            stageStatus === "locked" && "opacity-60"
                          )}
                        />
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {stageUserMissions.map((um) => {
                          const cost = um.mission?.estimated_cost;
                          const showCost =
                            cost != null && Number(cost) > 0;
                          const isCompleted = um.status === "completed";

                          return (
                            <div
                              key={um.id}
                              role="button"
                              tabIndex={0}
                              className={getMissionSurfaceStyles(
                                um.status,
                                cn(
                                  "rounded-lg border p-3 text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  isCompleted && "scale-[0.98] opacity-75"
                                )
                              )}
                              onClick={() => openMission(um)}
                              onKeyDown={(event) =>
                                handleMissionKeyDown(event, um)
                              }
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={getMissionTitleStyles(
                                    um.status,
                                    cn(
                                      "font-medium",
                                      isCompleted && "text-sm"
                                    )
                                  )}
                                >
                                  {um.mission?.title ?? "Mission"}
                                </p>
                                <MissionStatusBadge status={um.status} />
                              </div>
                              <p
                                className={cn(
                                  "mt-1 text-sm text-muted-foreground line-clamp-2",
                                  isCompleted && "text-xs"
                                )}
                              >
                                {um.mission?.description}
                              </p>
                              {showCost && (
                                <p className="mt-2 text-sm font-medium">
                                  {formatCurrency(Number(cost))}
                                </p>
                              )}
                              {um.mission && (
                                <MissionAgeNotice
                                  birthDate={birthDate}
                                  mission={um.mission}
                                  missions={missions}
                                  userMissions={userMissions}
                                  variant="inline"
                                  className="mt-2 text-xs text-amber-700 dark:text-amber-300"
                                />
                              )}
                              <p className="mt-2 text-xs text-muted-foreground">
                                FAA resources in details →
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
            {visibleStages.every((stage) => {
              const stageMissions = missions.filter(
                (mission) => mission.stage_id === stage.id
              );
              return !stageMissions.some((mission) => {
                const um = userMissions.find(
                  (entry) => entry.mission_id === mission.id
                );
                return (
                  um &&
                  matchesStatusFilter(
                    um.status,
                    statusFilter,
                    um.mission?.stage_id,
                    currentStage?.id
                  )
                );
              });
            }) && (
              <p className="text-muted-foreground">
                No missions match this filter.
              </p>
            )}
          </div>
        </div>

        <DashboardFaaSidebar
          storageKey="flightpath-missions-faa-sidebar"
          resources={stageResources}
          supplemental={supplementalFaaResources}
          defaultOpen={false}
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
