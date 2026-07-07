import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId, getCurrentProfile } from "@/lib/auth";
import { HangarContent } from "@/components/hangar/hangar-content";

export default async function HangarPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const studentId = await getActiveStudentId(params);
  const profile = await getCurrentProfile();

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", studentId)
    .order("created_at", { ascending: false });

  return (
    <HangarContent
      files={files ?? []}
      isStudent={profile?.role === "student"}
    />
  );
}
