import { getCurrentProfile } from "@/lib/auth";
import { getHangarData } from "@/lib/data";
import { HangarContent } from "@/components/hangar/hangar-content";
import type { FileCategory } from "@/types/models";

const VALID_CATEGORIES = new Set([
  "all",
  "certificates",
  "photos",
  "aircraft",
  "equipment",
  "documents",
]);

export default async function HangarPage({
  searchParams,
}: {
  searchParams: Promise<{
    student?: string;
    category?: string;
    open?: string;
    new?: string;
  }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const data = await getHangarData(params);

  const category =
    params.category && VALID_CATEGORIES.has(params.category)
      ? (params.category as FileCategory | "all")
      : "all";

  return (
    <HangarContent
      files={data.files}
      missions={data.missions}
      userMissions={data.userMissions}
      stages={data.stages}
      birthDate={data.studentProfile?.birth_date ?? null}
      isStudent={profile?.role === "student"}
      initialCategory={category}
      initialOpenFileId={params.open ?? null}
      initialOpenNew={params.new === "1"}
    />
  );
}
