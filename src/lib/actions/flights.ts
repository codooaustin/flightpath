"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function parseOptionalNumber(value: FormDataEntryValue | null): number | null {
  if (!value || value === "") return null;
  const num = parseFloat(value as string);
  return Number.isNaN(num) ? null : num;
}

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (!value || value === "") return null;
  const num = parseInt(value as string, 10);
  return Number.isNaN(num) ? null : num;
}

function flightFromFormData(formData: FormData) {
  const flightTime = parseFloat(formData.get("flight_time") as string);
  if (Number.isNaN(flightTime) || flightTime < 0) {
    return { error: "Flight time is required" as const };
  }

  return {
    data: {
      date: formData.get("date") as string,
      aircraft: (formData.get("aircraft") as string) || null,
      tail_number: (formData.get("tail_number") as string) || null,
      departure_airport: (formData.get("departure_airport") as string) || null,
      arrival_airport: (formData.get("arrival_airport") as string) || null,
      instructor: (formData.get("instructor") as string) || null,
      flight_time: flightTime,
      pic_time: parseOptionalNumber(formData.get("pic_time")),
      dual_time: parseOptionalNumber(formData.get("dual_time")),
      cross_country_time: parseOptionalNumber(formData.get("cross_country_time")),
      night_time: parseOptionalNumber(formData.get("night_time")),
      instrument_time: parseOptionalNumber(formData.get("instrument_time")),
      landings: parseOptionalInt(formData.get("landings")),
      notes: (formData.get("notes") as string) || null,
    },
  };
}

export async function createFlight(formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();
  const parsed = flightFromFormData(formData);

  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase.from("flights").insert({
    user_id: studentId,
    ...parsed.data,
  });

  if (error) return { error: error.message };

  revalidatePath("/logbook");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateFlight(id: string, formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();
  const parsed = flightFromFormData(formData);

  if ("error" in parsed) return { error: parsed.error };

  const { error } = await supabase
    .from("flights")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/logbook");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteFlight(id: string) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const { error } = await supabase
    .from("flights")
    .delete()
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/logbook");
  revalidatePath("/dashboard");
  return { success: true };
}
