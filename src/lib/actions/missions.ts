"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { MissionStatus } from "@/types/models";
import type { Database } from "@/types/database";

type UserMissionUpdate =
  Database["public"]["Tables"]["user_missions"]["Update"];

export async function updateMissionStatus(
  userMissionId: string,
  status: MissionStatus,
  notes?: string
) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const update: UserMissionUpdate = { status, notes: notes ?? null };
  if (status === "completed") {
    update.completion_date = new Date().toISOString().split("T")[0];
  }

  const { error } = await supabase
    .from("user_missions")
    .update(update)
    .eq("id", userMissionId)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  if (status === "completed") {
    const { data: completed } = await supabase
      .from("user_missions")
      .select("mission_id")
      .eq("id", userMissionId)
      .single();

    if (completed?.mission_id) {
      const { data: mission } = await supabase
        .from("missions")
        .select("order_number, stage_id")
        .eq("id", completed.mission_id)
        .single();

      if (mission) {
        const { data: nextMission } = await supabase
          .from("missions")
          .select("id")
          .eq("stage_id", mission.stage_id)
          .eq("order_number", mission.order_number + 1)
          .single();

        if (nextMission) {
          await supabase
            .from("user_missions")
            .update({ status: "available" })
            .eq("user_id", studentId)
            .eq("mission_id", nextMission.id)
            .eq("status", "locked");
        } else {
          const { data: currentStage } = await supabase
            .from("stages")
            .select("order_number")
            .eq("id", mission.stage_id)
            .single();

          if (currentStage) {
            const { data: nextStage } = await supabase
              .from("stages")
              .select("id")
              .eq("order_number", currentStage.order_number + 1)
              .single();

            if (nextStage) {
              const { data: firstMission } = await supabase
                .from("missions")
                .select("id")
                .eq("stage_id", nextStage.id)
                .eq("order_number", 1)
                .single();

              if (firstMission) {
                await supabase
                  .from("user_missions")
                  .update({ status: "available" })
                  .eq("user_id", studentId)
                  .eq("mission_id", firstMission.id)
                  .eq("status", "locked");
              }
            }
          }
        }
      }
    }
  }

  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  return { success: true };
}
