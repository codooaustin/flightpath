import {
  getMissionAgeBlockMessage,
  isMissionBlockedByAge,
} from "@/lib/missions/mission-eligibility";
import type { Mission, UserMission } from "@/types/models";

interface MissionAgeNoticeProps {
  birthDate: string | null;
  mission: Mission;
  missions: Mission[];
  userMissions: UserMission[];
  className?: string;
}

export function MissionAgeNotice({
  birthDate,
  mission,
  missions,
  userMissions,
  className,
}: MissionAgeNoticeProps) {
  if (!isMissionBlockedByAge(birthDate, mission, missions, userMissions)) {
    return null;
  }

  const message = getMissionAgeBlockMessage(birthDate, mission.title);
  if (!message) return null;

  return <p className={className}>{message}</p>;
}
