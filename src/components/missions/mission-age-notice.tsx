import {
  getMissionAgeBlockMessage,
  isMissionBlockedByAge,
} from "@/lib/missions/mission-eligibility";
import type { Mission, UserMission } from "@/types/models";
import { cn } from "@/lib/utils";
import { CalendarClock } from "lucide-react";

interface MissionAgeNoticeProps {
  birthDate: string | null;
  mission: Mission;
  missions: Mission[];
  userMissions: UserMission[];
  className?: string;
  variant?: "inline" | "callout";
}

export function MissionAgeNotice({
  birthDate,
  mission,
  missions,
  userMissions,
  className,
  variant = "callout",
}: MissionAgeNoticeProps) {
  if (!isMissionBlockedByAge(birthDate, mission, missions, userMissions)) {
    return null;
  }

  const message = getMissionAgeBlockMessage(birthDate, mission.title);
  if (!message) return null;

  if (variant === "inline") {
    return <p className={className}>{message}</p>;
  }

  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800 dark:bg-amber-950/40",
        className
      )}
    >
      <CalendarClock
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300"
        aria-hidden
      />
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
          Age requirement
        </p>
        <p className="text-sm text-amber-800 dark:text-amber-100">{message}</p>
      </div>
    </div>
  );
}
