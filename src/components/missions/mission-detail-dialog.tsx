"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MissionAgeNotice } from "@/components/missions/mission-age-notice";
import { MissionResourceLinks } from "@/components/missions/mission-resource-links";
import { canAdvanceMissionStatus } from "@/lib/missions/mission-eligibility";
import type { Mission, MissionStatus, UserMission } from "@/types/models";

interface MissionDetailDialogProps {
  selected: (UserMission & { mission?: Mission }) | null;
  missions: Mission[];
  birthDate: string | null;
  userMissions: (UserMission & { mission?: Mission })[];
  isStudent: boolean;
  loading: boolean;
  onClose: () => void;
  onStatusChange: (status: MissionStatus) => void;
}

export function MissionDetailDialog({
  selected,
  missions,
  birthDate,
  userMissions,
  isStudent,
  loading,
  onClose,
  onStatusChange,
}: MissionDetailDialogProps) {
  return (
    <Dialog open={!!selected} onOpenChange={(open) => !open && onClose()}>
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
          {selected?.mission && (
            <MissionAgeNotice
              birthDate={birthDate}
              mission={selected.mission}
              missions={missions}
              userMissions={userMissions}
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
            />
          )}
          {isStudent && selected && selected.status !== "completed" && (
            <div className="flex gap-2">
              {selected.status === "available" &&
                canAdvanceMissionStatus(
                  birthDate,
                  selected.mission?.title ?? "",
                  "in_progress"
                ).allowed && (
                  <Button
                    onClick={() => onStatusChange("in_progress")}
                    disabled={loading}
                  >
                    Take Off
                  </Button>
                )}
              {selected.status === "in_progress" &&
                canAdvanceMissionStatus(
                  birthDate,
                  selected.mission?.title ?? "",
                  "completed"
                ).allowed && (
                  <Button
                    onClick={() => onStatusChange("completed")}
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
  );
}
