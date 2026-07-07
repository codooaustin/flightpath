import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId, getCurrentProfile } from "@/lib/auth";
import { CalendarContent } from "@/components/calendar/calendar-content";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const studentId = await getActiveStudentId(params);
  const profile = await getCurrentProfile();

  const { data: events } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("user_id", studentId)
    .order("start_date");

  return (
    <CalendarContent
      events={events ?? []}
      isStudent={profile?.role === "student"}
    />
  );
}
