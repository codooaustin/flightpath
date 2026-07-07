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

  const birthDate = (formData.get("birth_date") as string) || null;
  if (birthDate) {
    const parsed = new Date(birthDate);
    if (parsed > new Date()) {
      return { error: "Birth date cannot be in the future" };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: formData.get("name") as string,
      home_airport: (formData.get("home_airport") as string) || null,
      career_goal: (formData.get("career_goal") as string) || null,
      target_airline: (formData.get("target_airline") as string) || null,
      birth_date: birthDate,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
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
