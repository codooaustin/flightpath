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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateMissionStatus } from "@/lib/actions/missions";
import { MISSION_STATUS_LABELS } from "@/types/models";
import type { Mission, MissionStatus, Stage, UserMission } from "@/types/models";
import { MissionStatusBadge, getMissionSurfaceStyles, getMissionTitleStyles } from "@/components/missions/mission-status-badge";
import { MissionResourceLinks } from "@/components/missions/mission-resource-links";
import { formatCurrency } from "@/lib/calculations/costs";
import { toast } from "sonner";

interface MissionsContentProps {
  stages: Stage[];
  userMissions: (UserMission & { mission?: Mission })[];
  isStudent: boolean;
}

export function MissionsContent({
  stages,
  userMissions,
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
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground">No missions match your filters.</p>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.mission?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">{selected?.mission?.description}</p>
            {selected?.mission?.why_it_matters && (
              <div>
                <p className="text-sm font-medium">Why it matters</p>
                <p className="text-sm text-muted-foreground">
                  {selected.mission.why_it_matters}
                </p>
              </div>
            )}
            {selected?.mission?.requirements &&
              selected.mission.requirements.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Requirements</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                    {selected.mission.requirements.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            {selected?.mission && (
              <MissionResourceLinks missionTitle={selected.mission.title} />
            )}
            {isStudent && selected && selected.status !== "completed" && (
              <div className="flex gap-2">
                {selected.status === "available" && (
                  <Button
                    onClick={() => handleStatusChange("in_progress")}
                    disabled={loading}
                  >
                    Take Off
                  </Button>
                )}
                {selected.status === "in_progress" && (
                  <Button
                    onClick={() => handleStatusChange("completed")}
                    disabled={loading}
                  >
                    Land
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
