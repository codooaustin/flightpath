import { getMissionsData, getLogbookData } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { sumFlightHours } from "@/lib/calculations/flight-hours";
import { RoadmapContent } from "@/components/roadmap/roadmap-content";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const [data, profile, logbook] = await Promise.all([
    getMissionsData(params),
    getCurrentProfile(),
    getLogbookData(params),
  ]);
  const hourTotals = sumFlightHours(logbook.flights);

  return (
    <RoadmapContent
      stages={data.stages}
      missions={data.missions}
      userMissions={data.userMissions}
      birthDate={data.studentProfile?.birth_date ?? null}
      isStudent={profile?.role === "student"}
      hourTotals={hourTotals}
    />
  );
}
