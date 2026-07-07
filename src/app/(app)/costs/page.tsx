import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId, getCurrentProfile } from "@/lib/auth";
import { CostsContent } from "@/components/costs/costs-content";

export default async function CostsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const studentId = await getActiveStudentId(params);
  const profile = await getCurrentProfile();

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", studentId)
    .order("date", { ascending: false });

  return (
    <CostsContent
      expenses={expenses ?? []}
      isStudent={profile?.role === "student"}
    />
  );
}
