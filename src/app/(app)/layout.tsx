import { Suspense } from "react";
import Link from "next/link";
import { Plane } from "lucide-react";
import { getCurrentProfile, getLinkedStudents } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { StudentSwitcher } from "@/components/student-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        profile={profile}
        logo={
          <Link href="/dashboard" className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-sky-600" />
            <span className="text-lg font-bold">Flight Path</span>
          </Link>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between gap-4 border-b px-4 lg:px-6">
          <div className="lg:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky-600" />
              <span className="font-bold">Flight Path</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle className="lg:hidden" />
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
              <p className="hidden text-sm text-muted-foreground sm:block">
                Link a student in Settings to view their progress
              </p>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
