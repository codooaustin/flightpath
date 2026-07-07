import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId, getCurrentProfile } from "@/lib/auth";
import { JournalContent } from "@/components/journal/journal-content";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const studentId = await getActiveStudentId(params);
  const profile = await getCurrentProfile();

  const [{ data: entries }, { data: missions }] = await Promise.all([
    supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", studentId)
      .order("entry_date", { ascending: false }),
    supabase.from("missions").select("*").order("order_number"),
  ]);

  return (
    <JournalContent
      entries={entries ?? []}
      missions={missions ?? []}
      isStudent={profile?.role === "student"}
    />
  );
}
