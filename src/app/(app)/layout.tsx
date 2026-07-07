import { Suspense } from "react";
import Link from "next/link";
import { Plane } from "lucide-react";
import { getCurrentProfile, getLinkedStudents } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { StudentSwitcher } from "@/components/student-switcher";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  const linkedStudents =
    profile?.role === "parent"
      ? await getLinkedStudents(profile.id)
      : [];

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        profile={profile}
        logo={
          <Link href="/dashboard" className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-sky-600" />
            <span className="text-lg font-bold">Flight Path</span>
          </Link>
        }
      />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
          <div className="lg:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky-600" />
              <span className="font-bold">Flight Path</span>
            </Link>
          </div>
          {profile?.role === "parent" && linkedStudents.length > 0 && (
            <Suspense fallback={null}>
              <StudentSwitcher
                students={linkedStudents.map((l) => ({
                  id: l.student_id,
                  name: l.student?.name ?? "Student",
                }))}
              />
            </Suspense>
          )}
          {profile?.role === "parent" && linkedStudents.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Link a student in Settings to view their progress
            </p>
          )}
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
