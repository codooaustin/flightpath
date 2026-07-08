import { getCurrentProfile } from "@/lib/auth";
import { getLogbookData } from "@/lib/data";
import { buildFlightMapEntries } from "@/lib/flights/map-data";
import { LogbookContent } from "@/components/logbook/logbook-content";

export default async function LogbookPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const data = await getLogbookData(params);
  const flightMapEntries = await buildFlightMapEntries(
    data.flights,
    data.flights.length
  );

  return (
    <LogbookContent
      flights={data.flights}
      flightMapEntries={flightMapEntries}
      stages={data.stages}
      missions={data.missions}
      userMissions={data.userMissions}
      isStudent={profile?.role === "student"}
      homeAirport={data.homeAirport}
    />
  );
}
