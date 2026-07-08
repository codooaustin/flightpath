"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import {
  canAdvanceMissionStatus,
  canRevertMissionStatus,
  isMissionAgeEligible,
} from "@/lib/missions/mission-eligibility";
import { syncAgeGatedMissionAvailability } from "@/lib/missions/sync-missions";
import { revalidatePath } from "next/cache";
import type { MissionStatus } from "@/types/models";
import type { Database } from "@/types/database";

type UserMissionUpdate =
  Database["public"]["Tables"]["user_missions"]["Update"];

async function unlockMissionIfEligible(
  studentId: string,
  missionId: string,
  birthDate: string | null,
  missionTitle: string
) {
  const supabase = await createClient();

  if (!isMissionAgeEligible(birthDate, missionTitle)) {
    return;
  }

  await supabase
    .from("user_missions")
    .update({ status: "available" })
    .eq("user_id", studentId)
    .eq("mission_id", missionId)
    .eq("status", "locked");
}

async function unlockFollowingMissions(
  studentId: string,
  completedMissionId: string,
  birthDate: string | null
) {
  const supabase = await createClient();

  const { data: mission } = await supabase
    .from("missions")
    .select("order_number, stage_id, title")
    .eq("id", completedMissionId)
    .single();

  if (!mission) return;

  const { data: nextMission } = await supabase
    .from("missions")
    .select("id, title")
    .eq("stage_id", mission.stage_id)
    .eq("order_number", mission.order_number + 1)
    .single();

  if (nextMission) {
    await unlockMissionIfEligible(
      studentId,
      nextMission.id,
      birthDate,
      nextMission.title
    );
    return;
  }

  const { data: currentStage } = await supabase
    .from("stages")
    .select("order_number")
    .eq("id", mission.stage_id)
    .single();

  if (!currentStage) return;

  const { data: nextStage } = await supabase
    .from("stages")
    .select("id")
    .eq("order_number", currentStage.order_number + 1)
    .single();

  if (!nextStage) return;

  const { data: firstMission } = await supabase
    .from("missions")
    .select("id, title")
    .eq("stage_id", nextStage.id)
    .eq("order_number", 1)
    .single();

  if (firstMission) {
    await unlockMissionIfEligible(
      studentId,
      firstMission.id,
      birthDate,
      firstMission.title
    );
  }
}

export async function updateMissionStatus(
  userMissionId: string,
  status: MissionStatus,
  notes?: string
) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const { data: profile } = await supabase
    .from("profiles")
    .select("birth_date")
    .eq("id", studentId)
    .single();

  const birthDate = profile?.birth_date ?? null;

  const { data: userMission } = await supabase
    .from("user_missions")
    .select("mission_id, status")
    .eq("id", userMissionId)
    .eq("user_id", studentId)
    .single();

  if (!userMission) return { error: "Mission not found" };

  const { data: mission } = await supabase
    .from("missions")
    .select("title")
    .eq("id", userMission.mission_id)
    .single();

  if (!mission) return { error: "Mission not found" };

  const isRevert =
    userMission.status === "completed" && status === "in_progress";

  if (isRevert) {
    const revertEligibility = canRevertMissionStatus(userMission.status);
    if (!revertEligibility.allowed) {
      return { error: revertEligibility.error };
    }
  } else if (status === "in_progress" || status === "completed") {
    const eligibility = canAdvanceMissionStatus(
      birthDate,
      mission.title,
      status
    );
    if (!eligibility.allowed) {
      return { error: eligibility.error };
    }
  }

  const update: UserMissionUpdate = { status, notes: notes ?? null };
  if (status === "completed") {
    update.completion_date = new Date().toISOString().split("T")[0];
  } else if (isRevert) {
    update.completion_date = null;
  }

  const { error } = await supabase
    .from("user_missions")
    .update(update)
    .eq("id", userMissionId)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  const shouldSync = status === "completed" || isRevert;

  if (status === "completed") {
    await unlockFollowingMissions(studentId, userMission.mission_id, birthDate);
  }

  if (shouldSync) {
    const [{ data: missions }, { data: userMissions }] = await Promise.all([
      supabase.from("missions").select("*").order("order_number"),
      supabase.from("user_missions").select("*").eq("user_id", studentId),
    ]);

    if (missions && userMissions) {
      const { data: stages } = await supabase
        .from("stages")
        .select("*")
        .order("order_number");

      await syncAgeGatedMissionAvailability(
        studentId,
        birthDate,
        missions,
        userMissions,
        stages ?? []
      );
    }
  }

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  return { success: true };
}
