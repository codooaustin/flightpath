import { getJournalData } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { JournalContent } from "@/components/journal/journal-content";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{
    student?: string;
    open?: string;
    new?: string;
    mission?: string;
  }>;
}) {
  const params = await searchParams;
  const [data, profile] = await Promise.all([
    getJournalData(params),
    getCurrentProfile(),
  ]);

  return (
    <JournalContent
      entries={data.entries}
      missions={data.missions}
      userMissions={data.userMissions}
      stages={data.stages}
      birthDate={data.studentProfile?.birth_date ?? null}
      isStudent={profile?.role === "student"}
      initialOpenEntryId={params.open ?? null}
      initialOpenNew={params.new === "1"}
      initialMissionId={params.mission ?? null}
    />
  );
}
