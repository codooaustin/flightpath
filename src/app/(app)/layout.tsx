import { Suspense } from "react";
import { getCurrentProfile, getLinkedStudents } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { FlightPathLogo } from "@/components/flight-path-logo";
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
      <AppSidebar profile={profile} logo={<FlightPathLogo />} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
          <div className="lg:hidden">
            <FlightPathLogo size="sm" />
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
