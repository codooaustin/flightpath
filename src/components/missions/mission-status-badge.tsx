import { Badge } from "@/components/ui/badge";
import { MISSION_STATUS_LABELS } from "@/types/models";
import type { MissionStatus } from "@/types/models";
import { cn } from "@/lib/utils";

const statusStyles: Record<MissionStatus, string> = {
  locked:
    "border-muted-foreground/25 bg-muted text-muted-foreground",
  available:
    "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300",
  in_progress:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
  completed:
    "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300",
};

export const missionSurfaceStyles: Record<MissionStatus, string> = {
  locked:
    "border-dashed border-muted-foreground/25 bg-muted/25 opacity-75 hover:opacity-90",
  available:
    "border-sky-300 border-l-4 border-l-sky-500 bg-sky-50/70 shadow-sm ring-1 ring-sky-100 hover:border-sky-400 dark:border-sky-700 dark:border-l-sky-400 dark:bg-sky-950/30 dark:ring-sky-900",
  in_progress:
    "border-amber-300 border-l-4 border-l-amber-500 bg-amber-50/70 shadow-md ring-1 ring-amber-100 hover:border-amber-400 dark:border-amber-700 dark:border-l-amber-400 dark:bg-amber-950/30 dark:ring-amber-900",
  completed:
    "border-green-200 bg-green-50/40 opacity-80 hover:opacity-95 dark:border-green-800 dark:bg-green-950/20",
};

export const missionTitleStyles: Record<MissionStatus, string> = {
  locked: "text-muted-foreground",
  available: "text-foreground",
  in_progress: "text-foreground",
  completed: "text-muted-foreground line-through decoration-green-600/40",
};

export function getMissionSurfaceStyles(status: MissionStatus, className?: string) {
  return cn(missionSurfaceStyles[status], className);
}

export function getMissionTitleStyles(status: MissionStatus, className?: string) {
  return cn(missionTitleStyles[status], className);
}

export type StageTimelineStatus = "completed" | "current" | "locked";

export const stageSurfaceStyles: Record<StageTimelineStatus, string> = {
  locked: missionSurfaceStyles.locked,
  current: missionSurfaceStyles.in_progress,
  completed: missionSurfaceStyles.completed,
};

export const stageBadgeStyles: Record<StageTimelineStatus, string> = {
  locked: statusStyles.locked,
  current: statusStyles.in_progress,
  completed: statusStyles.completed,
};

export function getStageSurfaceStyles(
  status: StageTimelineStatus,
  className?: string
) {
  return cn(stageSurfaceStyles[status], className);
}

export function MissionStatusBadge({
  status,
  className,
}: {
  status: MissionStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(statusStyles[status], className)}>
      {MISSION_STATUS_LABELS[status]}
    </Badge>
  );
}
