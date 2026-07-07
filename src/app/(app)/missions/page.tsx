import { getMissionsData } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { MissionsContent } from "@/components/missions/missions-content";

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const [data, profile] = await Promise.all([
    getMissionsData(params),
    getCurrentProfile(),
  ]);

  return (
    <MissionsContent
      stages={data.stages}
      userMissions={data.userMissions}
      isStudent={profile?.role === "student"}
    />
  );
}
