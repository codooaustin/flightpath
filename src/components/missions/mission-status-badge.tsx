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
