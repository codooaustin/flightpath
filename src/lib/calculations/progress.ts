import type { Mission, Stage, UserMission } from "@/types/models";

export function calculateProgress(userMissions: UserMission[]) {
  const total = userMissions.length;
  const completed = userMissions.filter((m) => m.status === "completed").length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, percentage };
}

export function calculateStageProgress(
  stage: Stage,
  missions: Mission[],
  userMissions: UserMission[]
) {
  const stageMissionIds = missions
    .filter((m) => m.stage_id === stage.id)
    .map((m) => m.id);
  const stageUserMissions = userMissions.filter((um) =>
    stageMissionIds.includes(um.mission_id)
  );
  return calculateProgress(stageUserMissions);
}

export function getCurrentStage(
  stages: Stage[],
  missions: Mission[],
  userMissions: UserMission[]
): Stage | null {
  const sortedStages = [...stages].sort(
    (a, b) => a.order_number - b.order_number
  );

  for (const stage of sortedStages) {
    const progress = calculateStageProgress(stage, missions, userMissions);
    if (progress.percentage < 100) {
      return stage;
    }
  }

  return sortedStages[sortedStages.length - 1] ?? null;
}

export function getStageStatus(
  stage: Stage,
  currentStage: Stage | null
): "completed" | "current" | "locked" {
  if (!currentStage) return "locked";
  if (stage.order_number < currentStage.order_number) return "completed";
  if (stage.order_number === currentStage.order_number) return "current";
  return "locked";
}

export function getNextMission(
  userMissions: (UserMission & { mission?: Mission })[]
) {
  const priority = ["in_progress", "available", "locked"] as const;
  for (const status of priority) {
    const found = userMissions.find((um) => um.status === status);
    if (found) return found;
  }
  return null;
}
