import { getDashboardData } from "@/lib/data";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const data = await getDashboardData(params);

  return (
    <DashboardContent
      stages={data.stages}
      missions={data.missions}
      userMissions={data.userMissions}
      events={data.events}
      expenses={data.expenses}
      journal={data.journal}
    />
  );
}
