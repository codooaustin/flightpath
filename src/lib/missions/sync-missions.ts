import { createClient } from "@/lib/supabase/server";
import {
  areStagePrerequisitesMet,
  isMissionAgeEligible,
} from "@/lib/missions/mission-eligibility";
import type { Mission, Stage, UserMission } from "@/types/models";

async function setMissionStatus(
  studentId: string,
  userMissionId: string,
  status: "available" | "locked"
) {
  const supabase = await createClient();
  await supabase
    .from("user_missions")
    .update({ status })
    .eq("id", userMissionId)
    .eq("user_id", studentId);
}

function isPreviousStageComplete(
  stage: Stage,
  stages: Stage[],
  missions: Mission[],
  userMissions: UserMission[]
) {
  if (stage.order_number <= 1) return true;

  const previousStage = stages.find(
    (entry) => entry.order_number === stage.order_number - 1
  );
  if (!previousStage) return true;

  return missions
    .filter((mission) => mission.stage_id === previousStage.id)
    .every((mission) => {
      const userMission = userMissions.find(
        (entry) => entry.mission_id === mission.id
      );
      return userMission?.status === "completed";
    });
}

export async function syncAgeGatedMissionAvailability(
  studentId: string,
  birthDate: string | null | undefined,
  missions: Mission[],
  userMissions: UserMission[],
  stages: Stage[]
) {
  const sortedStages = [...stages].sort(
    (left, right) => left.order_number - right.order_number
  );

  for (const stage of sortedStages) {
    if (!isPreviousStageComplete(stage, sortedStages, missions, userMissions)) {
      continue;
    }

    const stageMissions = missions
      .filter((mission) => mission.stage_id === stage.id)
      .sort((left, right) => left.order_number - right.order_number);

    let reachedIncompleteMission = false;

    for (const mission of stageMissions) {
      const userMission = userMissions.find(
        (entry) => entry.mission_id === mission.id
      );
      if (!userMission) continue;

      if (userMission.status === "completed") {
        continue;
      }

      if (reachedIncompleteMission) {
        if (userMission.status !== "locked") {
          await setMissionStatus(studentId, userMission.id, "locked");
          userMission.status = "locked";
        }
        continue;
      }

      reachedIncompleteMission = true;

      const prerequisitesMet = areStagePrerequisitesMet(
        mission,
        missions,
        userMissions
      );
      const ageEligible = isMissionAgeEligible(birthDate, mission.title);
      const shouldBeAvailable = prerequisitesMet && ageEligible;

      if (shouldBeAvailable && userMission.status === "locked") {
        await setMissionStatus(studentId, userMission.id, "available");
        userMission.status = "available";
      }

      if (
        !shouldBeAvailable &&
        (userMission.status === "available" ||
          userMission.status === "in_progress")
      ) {
        await setMissionStatus(studentId, userMission.id, "locked");
        userMission.status = "locked";
      }
    }
  }
}
