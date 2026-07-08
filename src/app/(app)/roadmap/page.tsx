import { getMissionsData } from "@/lib/data";
import { RoadmapContent } from "@/components/roadmap/roadmap-content";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const data = await getMissionsData(params);

  return (
    <RoadmapContent
      stages={data.stages}
      missions={data.missions}
      userMissions={data.userMissions}
      birthDate={data.studentProfile?.birth_date ?? null}
    />
  );
}
