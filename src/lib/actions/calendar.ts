"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { EventType } from "@/types/models";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const { error } = await supabase.from("calendar_events").insert({
    user_id: studentId,
    title: formData.get("title") as string,
    type: formData.get("type") as EventType,
    start_date: formData.get("start_date") as string,
    end_date: (formData.get("end_date") as string) || null,
    description: (formData.get("description") as string) || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: formData.get("title") as string,
      type: formData.get("type") as EventType,
      start_date: formData.get("start_date") as string,
      end_date: (formData.get("end_date") as string) || null,
      description: (formData.get("description") as string) || null,
      completed: formData.get("completed") === "true",
    })
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleEventComplete(id: string, completed: boolean) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const { error } = await supabase
    .from("calendar_events")
    .update({ completed })
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { success: true };
}
