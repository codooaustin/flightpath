"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createJournalEntry(formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const missionId = formData.get("mission_id") as string;

  const { error } = await supabase.from("journal_entries").insert({
    user_id: studentId,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    entry_date: formData.get("entry_date") as string,
    mission_id: missionId && missionId !== "none" ? missionId : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateJournalEntry(id: string, formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const missionId = formData.get("mission_id") as string;

  const { error } = await supabase
    .from("journal_entries")
    .update({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      entry_date: formData.get("entry_date") as string,
      mission_id: missionId && missionId !== "none" ? missionId : null,
    })
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  return { success: true };
}
