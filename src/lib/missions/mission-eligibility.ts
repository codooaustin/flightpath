import {
  formatAgeEligibility,
  getAge,
  getPilotMilestones,
  isAgeEligible,
  type PilotMilestone,
} from "@/lib/calculations/certification";
import type { Mission, UserMission } from "@/types/models";

const MISSION_MILESTONE_IDS: Record<string, string> = {
  "Obtain Student Pilot Certificate": "student_pilot",
  "First Solo Flight": "first_solo",
  "Pass Private Pilot Checkride": "private_pilot",
};

export function getMissionMilestone(missionTitle: string): PilotMilestone | null {
  const milestoneId = MISSION_MILESTONE_IDS[missionTitle];
  if (!milestoneId) return null;
  return getPilotMilestones().find((milestone) => milestone.id === milestoneId) ?? null;
}

export function getMissionMinimumAge(missionTitle: string): number | null {
  return getMissionMilestone(missionTitle)?.minimum_age ?? null;
}

export function isMissionAgeEligible(
  birthDate: string | null | undefined,
  missionTitle: string
): boolean {
  const milestone = getMissionMilestone(missionTitle);
  if (!milestone) return true;
  if (!birthDate) return false;
  return isAgeEligible(getAge(birthDate), milestone);
}

export function getMissionAgeBlockMessage(
  birthDate: string | null | undefined,
  missionTitle: string
): string | null {
  const milestone = getMissionMilestone(missionTitle);
  if (!milestone) return null;
  if (isMissionAgeEligible(birthDate, missionTitle)) return null;
  if (!birthDate) {
    return `Add your birthday in Settings to unlock ${milestone.name}. FAA minimum age is ${milestone.minimum_age}.`;
  }
  return formatAgeEligibility(birthDate, milestone);
}

export function isMissionAgeGated(missionTitle: string): boolean {
  return missionTitle in MISSION_MILESTONE_IDS;
}

export function areStagePrerequisitesMet(
  mission: Mission,
  missions: Mission[],
  userMissions: UserMission[],
  birthDate?: string | null
): boolean {
  const stageMissions = missions
    .filter((entry) => entry.stage_id === mission.stage_id)
    .sort((a, b) => a.order_number - b.order_number);

  for (const stageMission of stageMissions) {
    if (stageMission.order_number >= mission.order_number) break;
    const userMission = userMissions.find(
      (entry) => entry.mission_id === stageMission.id
    );
    if (userMission?.status === "completed") continue;

    // Waiting on FAA age alone should not block other prep work in the stage.
    if (
      isMissionAgeGated(stageMission.title) &&
      !isMissionAgeEligible(birthDate, stageMission.title)
    ) {
      continue;
    }

    return false;
  }

  return true;
}

export function isMissionBlockedByAge(
  birthDate: string | null | undefined,
  mission: Mission,
  missions: Mission[],
  userMissions: UserMission[]
): boolean {
  if (!isMissionAgeGated(mission.title)) return false;
  if (!areStagePrerequisitesMet(mission, missions, userMissions, birthDate)) {
    return false;
  }
  return !isMissionAgeEligible(birthDate, mission.title);
}

export function canAdvanceMissionStatus(
  birthDate: string | null | undefined,
  missionTitle: string,
  nextStatus: "in_progress" | "completed"
): { allowed: boolean; error?: string } {
  if (nextStatus !== "in_progress" && nextStatus !== "completed") {
    return { allowed: true };
  }

  if (!isMissionAgeEligible(birthDate, missionTitle)) {
    return {
      allowed: false,
      error:
        getMissionAgeBlockMessage(birthDate, missionTitle) ??
        "You do not meet the FAA age requirement for this mission yet.",
    };
  }

  return { allowed: true };
}
