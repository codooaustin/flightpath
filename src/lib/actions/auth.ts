"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  // #region agent log
  let parsedUrl: { hostname: string; pathname: string; hasTrailingSlash: boolean } | null = null;
  try {
    const u = new URL(supabaseUrl);
    parsedUrl = {
      hostname: u.hostname,
      pathname: u.pathname,
      hasTrailingSlash: supabaseUrl.endsWith("/"),
    };
  } catch {
    parsedUrl = null;
  }
  fetch("http://127.0.0.1:7748/ingest/31e8cc83-dec8-45f9-bd98-0bf9041c7005", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "27026c",
    },
    body: JSON.stringify({
      sessionId: "27026c",
      runId: "pre-fix",
      hypothesisId: "A,C",
      location: "src/lib/actions/auth.ts:signUp:entry",
      message: "signUp env and URL shape",
      data: {
        rawSupabaseUrlPathname: (() => {
          try {
            return new URL(rawSupabaseUrl).pathname;
          } catch {
            return null;
          }
        })(),
        normalizedSupabaseUrlPathname: parsedUrl?.pathname ?? null,
        urlWasNormalized: rawSupabaseUrl !== supabaseUrl,
        supabaseUrlSet: Boolean(supabaseUrl),
        anonKeySet: Boolean(anonKey),
        anonKeyLength: anonKey.length,
        parsedUrl,
        isSupabaseHost: parsedUrl?.hostname.endsWith(".supabase.co") ?? false,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
    // #region agent log
    fetch("http://127.0.0.1:7748/ingest/31e8cc83-dec8-45f9-bd98-0bf9041c7005", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "27026c",
      },
      body: JSON.stringify({
        sessionId: "27026c",
        runId: "pre-fix",
        hypothesisId: "A,B,C,D",
        location: "src/lib/actions/auth.ts:signUp:error",
        message: "signUp supabase auth error",
        data: {
          errorMessage: error.message,
          errorName: error.name,
          errorStatus: error.status,
          errorCode: (error as { code?: string }).code ?? null,
          parsedUrl,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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

  const { error } = await supabase
    .from("profiles")
    .update({
      name: formData.get("name") as string,
      home_airport: (formData.get("home_airport") as string) || null,
      career_goal: (formData.get("career_goal") as string) || null,
      target_airline: (formData.get("target_airline") as string) || null,
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
