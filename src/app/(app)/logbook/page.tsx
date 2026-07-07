import { getCurrentProfile } from "@/lib/auth";
import { getLogbookData } from "@/lib/data";
import { LogbookContent } from "@/components/logbook/logbook-content";

export default async function LogbookPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const data = await getLogbookData(params);

  return (
    <LogbookContent
      flights={data.flights}
      isStudent={profile?.role === "student"}
    />
  );
}
