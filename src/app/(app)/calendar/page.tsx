import { getCalendarData } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { CalendarContent } from "@/components/calendar/calendar-content";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; date?: string; open?: string }>;
}) {
  const params = await searchParams;
  const [data, profile] = await Promise.all([
    getCalendarData(params),
    getCurrentProfile(),
  ]);

  return (
    <CalendarContent
      events={data.events}
      flights={data.flights}
      stages={data.stages}
      missions={data.missions}
      userMissions={data.userMissions}
      birthDate={data.studentProfile?.birth_date ?? null}
      isStudent={profile?.role === "student"}
      initialDate={params.date ?? null}
      initialOpenEventId={params.open ?? null}
    />
  );
}
