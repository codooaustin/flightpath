import { getMissionsData } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { MissionsContent } from "@/components/missions/missions-content";

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; open?: string; view?: string }>;
}) {
  const params = await searchParams;
  const [data, profile] = await Promise.all([
    getMissionsData(params),
    getCurrentProfile(),
  ]);

  return (
    <MissionsContent
      stages={data.stages}
      missions={data.missions}
      userMissions={data.userMissions}
      birthDate={data.studentProfile?.birth_date ?? null}
      isStudent={profile?.role === "student"}
      initialOpenMissionId={params.open ?? null}
    />
  );
}
