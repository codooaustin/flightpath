"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMissionStatus } from "@/lib/actions/missions";
import { MISSION_STATUS_LABELS } from "@/types/models";
import type { Mission, MissionStatus, Stage, UserMission } from "@/types/models";
import { MissionStatusBadge, getMissionSurfaceStyles, getMissionTitleStyles } from "@/components/missions/mission-status-badge";
import { MissionResourceLinks } from "@/components/missions/mission-resource-links";
import { MissionAgeNotice } from "@/components/missions/mission-age-notice";
import { MissionDetailDialog } from "@/components/missions/mission-detail-dialog";
import { formatCurrency } from "@/lib/calculations/costs";
import { toast } from "sonner";

interface MissionsContentProps {
  stages: Stage[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  birthDate: string | null;
  isStudent: boolean;
}

export function MissionsContent({
  stages,
  missions,
  userMissions,
  birthDate,
  isStudent,
}: MissionsContentProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selected, setSelected] = useState<
    (UserMission & { mission?: Mission }) | null
  >(null);
  const [loading, setLoading] = useState(false);

  const filtered = userMissions.filter((um) => {
    if (statusFilter !== "all" && um.status !== statusFilter) return false;
    if (stageFilter !== "all" && um.mission?.stage_id !== stageFilter)
      return false;
    return true;
  });

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Missions</h1>
        <p className="text-muted-foreground">
          Complete missions to advance your aviation career
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(MISSION_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={(v) => v && setStageFilter(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((um) => (
          <Card
            key={um.id}
            className={getMissionSurfaceStyles(
              um.status,
              "cursor-pointer transition-all hover:shadow-md"
            )}
            onClick={() => setSelected(um)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle
                  className={getMissionTitleStyles(um.status, "text-base")}
                >
                  {um.mission?.title ?? "Mission"}
                </CardTitle>
                <MissionStatusBadge status={um.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {um.mission?.description}
              </p>
              {um.mission?.estimated_cost != null && (
                <p className="text-sm font-medium">
                  {formatCurrency(Number(um.mission.estimated_cost))}
                </p>
              )}
              {um.mission && (
                <MissionResourceLinks
                  missionTitle={um.mission.title}
                  compact
                  onClick={(event) => event.stopPropagation()}
                />
              )}
              {um.mission && (
                <MissionAgeNotice
                  birthDate={birthDate}
                  mission={um.mission}
                  missions={missions}
                  userMissions={userMissions}
                  className="text-xs text-amber-700 dark:text-amber-300"
                />
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground">No missions match your filters.</p>
        )}
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
