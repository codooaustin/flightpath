import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/models";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: UserRole) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) redirect("/dashboard");
  return profile;
}

export async function getActiveStudentId(
  searchParams?: { student?: string }
): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.role === "student") {
    return profile.id;
  }

  const supabase = await createClient();

  if (searchParams?.student) {
    const { data: link } = await supabase
      .from("student_parent_links")
      .select("student_id")
      .eq("parent_id", profile.id)
      .eq("student_id", searchParams.student)
      .single();

    if (link) return link.student_id;
  }

  const { data: links } = await supabase
    .from("student_parent_links")
    .select("student_id")
    .eq("parent_id", profile.id)
    .limit(1);

  if (links && links.length > 0) {
    return links[0].student_id;
  }

  return profile.id;
}

export async function getLinkedStudents(parentId: string) {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("student_parent_links")
    .select("*")
    .eq("parent_id", parentId);

  if (!links || links.length === 0) return [];

  const studentIds = links.map((l) => l.student_id);
  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .in("id", studentIds);

  const studentMap = new Map(students?.map((s) => [s.id, s]) ?? []);

  return links.map((link) => ({
    ...link,
    student: studentMap.get(link.student_id),
  }));
}
