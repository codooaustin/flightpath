import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId, getCurrentProfile } from "@/lib/auth";
import { withSignedFileUrls } from "@/lib/supabase/storage";
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

  const filesWithUrls = await withSignedFileUrls(supabase, files ?? []);

  return (
    <HangarContent
      files={filesWithUrls}
      isStudent={profile?.role === "student"}
    />
  );
}
