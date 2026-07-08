"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const updates: {
    name?: string;
    birth_date?: string | null;
    home_airport?: string | null;
    career_goal?: string | null;
    target_airline?: string | null;
  } = {};

  if (formData.has("name")) {
    const name = (formData.get("name") as string)?.trim();
    if (!name) return { error: "Name is required" };
    updates.name = name;
  }

  if (formData.has("birth_date")) {
    const birthDate = (formData.get("birth_date") as string) || null;
    if (birthDate) {
      const parsed = new Date(birthDate);
      if (parsed > new Date()) {
        return { error: "Birth date cannot be in the future" };
      }
    }
    updates.birth_date = birthDate;
  }

  if (formData.has("home_airport")) {
    const airport = (formData.get("home_airport") as string)
      ?.trim()
      .toUpperCase();
    if (airport && !/^[A-Z0-9]{3,4}$/.test(airport)) {
      return { error: "Home airport must be a 3-4 character ICAO/IATA code" };
    }
    updates.home_airport = airport || null;
  }

  if (formData.has("career_goal")) {
    updates.career_goal = (formData.get("career_goal") as string) || null;
  }

  if (formData.has("target_airline")) {
    updates.target_airline = (formData.get("target_airline") as string) || null;
  }

  if (Object.keys(updates).length === 0) {
    return { success: true };
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { error: error.message };

  return { success: true };
}

export async function linkStudent(studentEmail: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: student } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", studentEmail)
    .single();

  if (!student) return { error: "Student not found" };
  if (student.role !== "student") return { error: "User is not a student" };

  const { error } = await supabase.from("student_parent_links").insert({
    parent_id: user.id,
    student_id: student.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function unlinkStudent(linkId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("student_parent_links")
    .delete()
    .eq("id", linkId)
    .eq("parent_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return { success: true };
}
