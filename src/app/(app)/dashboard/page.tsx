import { getDashboardData } from "@/lib/data";
import { buildFlightMapEntries } from "@/lib/flights/map-data";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const data = await getDashboardData(params);
  const flightMapEntries = await buildFlightMapEntries(
    data.flights,
    data.flights.length
  );

  return (
    <DashboardContent
      stages={data.stages}
      missions={data.missions}
      userMissions={data.userMissions}
      events={data.events}
      expenses={data.expenses}
      journal={data.journal}
      flights={data.flights}
      flightMapEntries={flightMapEntries}
      studentProfile={data.studentProfile}
    />
  );
}
