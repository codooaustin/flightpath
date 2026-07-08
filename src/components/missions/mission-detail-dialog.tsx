"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MissionAgeNotice } from "@/components/missions/mission-age-notice";
import { MissionResourceLinks } from "@/components/missions/mission-resource-links";
import { MissionStatusBadge } from "@/components/missions/mission-status-badge";
import { formatCurrency } from "@/lib/calculations/costs";
import {
  canAdvanceMissionStatus,
  canRevertMissionStatus,
} from "@/lib/missions/mission-eligibility";
import type { Mission, MissionStatus, UserMission } from "@/types/models";
import { Clock, Lightbulb, ListChecks } from "lucide-react";

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

function MissionSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
        {title}
      </h3>
      {children}
    </section>
  );
}

const ACTION_HINTS = {
  takeOff: "Start this step when you're ready to work on it.",
  land: "Mark complete only after you've finished every requirement.",
  undoLand: "Reopens this mission if you landed it by mistake.",
} as const;

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
  const mission = selected?.mission;
  const canTakeOff =
    isStudent &&
    selected?.status === "available" &&
    canAdvanceMissionStatus(birthDate, mission?.title ?? "", "in_progress")
      .allowed;
  const canLand =
    isStudent &&
    selected?.status === "in_progress" &&
    canAdvanceMissionStatus(birthDate, mission?.title ?? "", "completed").allowed;
  const canUndo =
    isStudent &&
    selected?.status === "completed" &&
    canRevertMissionStatus(selected.status).allowed;
  const showActions = canTakeOff || canLand || canUndo;

  return (
    <Dialog open={!!selected} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,640px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-3 border-b px-4 pt-4 pb-4 pr-12">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <DialogTitle className="text-lg leading-snug">
              {mission?.title}
            </DialogTitle>
            {selected && <MissionStatusBadge status={selected.status} />}
          </div>
          {mission?.description && (
            <DialogDescription className="text-sm leading-relaxed">
              {mission.description}
            </DialogDescription>
          )}
          {mission &&
            (mission.estimated_duration || mission.estimated_cost != null) && (
              <div className="flex flex-wrap gap-2">
                {mission.estimated_duration && (
                  <Badge variant="secondary" className="gap-1 font-normal">
                    <Clock className="h-3 w-3" aria-hidden />
                    {mission.estimated_duration}
                  </Badge>
                )}
                {mission.estimated_cost != null &&
                  Number(mission.estimated_cost) > 0 && (
                    <Badge variant="outline" className="font-normal">
                      Est. {formatCurrency(Number(mission.estimated_cost))}
                    </Badge>
                  )}
              </div>
            )}
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {mission?.why_it_matters && (
            <MissionSection title="Why this matters" icon={Lightbulb}>
              <p className="rounded-lg border border-sky-200/80 bg-sky-50/60 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground dark:border-sky-900 dark:bg-sky-950/30">
                {mission.why_it_matters}
              </p>
            </MissionSection>
          )}

          {mission?.requirements && mission.requirements.length > 0 && (
            <MissionSection title="What you'll do" icon={ListChecks}>
              <ul className="space-y-2">
                {mission.requirements.map((requirement) => (
                  <li
                    key={requirement}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600"
                      aria-hidden
                    />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </MissionSection>
          )}

          {mission && (
            <MissionAgeNotice
              birthDate={birthDate}
              mission={mission}
              missions={missions}
              userMissions={userMissions}
            />
          )}

          {mission && <MissionResourceLinks missionTitle={mission.title} />}
        </div>

        {showActions && (
          <DialogFooter className="mt-0 flex-col items-stretch gap-2 sm:flex-col sm:items-stretch">
            <div className="flex flex-wrap gap-2">
              {canTakeOff && (
                <Button
                  onClick={() => onStatusChange("in_progress")}
                  disabled={loading}
                >
                  Take Off
                </Button>
              )}
              {canLand && (
                <Button
                  onClick={() => onStatusChange("completed")}
                  disabled={loading}
                >
                  Land
                </Button>
              )}
              {canUndo && (
                <Button
                  variant="outline"
                  onClick={() => onStatusChange("in_progress")}
                  disabled={loading}
                >
                  Undo Land
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {canTakeOff && ACTION_HINTS.takeOff}
              {canLand && ACTION_HINTS.land}
              {canUndo && ACTION_HINTS.undoLand}
            </p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
