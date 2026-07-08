import { getCostsData } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { CostsContent } from "@/components/costs/costs-content";

export default async function CostsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; open?: string; new?: string }>;
}) {
  const params = await searchParams;
  const [data, profile] = await Promise.all([
    getCostsData(params),
    getCurrentProfile(),
  ]);

  return (
    <CostsContent
      expenses={data.expenses}
      flights={data.flights}
      missions={data.missions}
      userMissions={data.userMissions}
      stages={data.stages}
      isStudent={profile?.role === "student"}
      initialOpenExpenseId={params.open ?? null}
      initialOpenNew={params.new === "1"}
    />
  );
}
