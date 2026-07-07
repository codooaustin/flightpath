import { getCurrentProfile, getLinkedStudents } from "@/lib/auth";
import { SettingsContent } from "@/components/settings/settings-content";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const linkedStudents =
    profile.role === "parent"
      ? await getLinkedStudents(profile.id)
      : [];

  return (
    <SettingsContent profile={profile} linkedStudents={linkedStudents} />
  );
}
