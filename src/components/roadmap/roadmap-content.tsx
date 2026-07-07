"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import {
  calculateStageProgress,
  getCurrentStage,
  getStageStatus,
} from "@/lib/calculations/progress";
import type { Mission, Stage, UserMission } from "@/types/models";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/calculations/costs";

interface RoadmapContentProps {
  stages: Stage[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
}

export function RoadmapContent({
  stages,
  missions,
  userMissions,
}: RoadmapContentProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const currentStage = getCurrentStage(stages, missions, userMissions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Career Roadmap</h1>
        <p className="text-muted-foreground">
          Your path from first flight to airline captain
        </p>
      </div>

      <div className="relative space-y-4">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage, currentStage);
          const stageProgress = calculateStageProgress(
            stage,
            missions,
            userMissions
          );
          const stageMissions = missions.filter((m) => m.stage_id === stage.id);
          const isExpanded = expandedStage === stage.id;

          return (
            <div key={stage.id} className="relative flex gap-4">
              {index < stages.length - 1 && (
                <div className="absolute left-[19px] top-10 h-[calc(100%+8px)] w-0.5 bg-border" />
              )}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                  status === "completed" &&
                    "border-green-500 bg-green-50 text-green-600",
                  status === "current" &&
                    "border-sky-500 bg-sky-50 text-sky-600",
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
                  "flex-1 cursor-pointer transition-shadow hover:shadow-md",
                  status === "current" && "border-sky-200"
                )}
                onClick={() =>
                  setExpandedStage(isExpanded ? null : stage.id)
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{stage.name}</CardTitle>
                    <Badge
                      variant={
                        status === "completed"
                          ? "default"
                          : status === "current"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {stageProgress.percentage}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stage.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Progress value={stageProgress.percentage} className="h-1.5" />
                  {isExpanded && (
                    <ul className="mt-4 space-y-2">
                      {stageMissions.map((mission) => {
                        const um = userMissions.find(
                          (u) => u.mission_id === mission.id
                        );
                        return (
                          <li
                            key={mission.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <p className="font-medium">{mission.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {mission.estimated_duration}
                                {mission.estimated_cost
                                  ? ` · ${formatCurrency(Number(mission.estimated_cost))}`
                                  : ""}
                              </p>
                            </div>
                            <MissionStatusBadge status={um?.status ?? "locked"} />
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
  );
}
