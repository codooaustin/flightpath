"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateProfile, linkStudent, unlinkStudent } from "@/lib/actions/auth";
import { ProfileAvatarUpload } from "@/components/settings/profile-avatar-upload";
import { AccountSecurityCard } from "@/components/settings/account-security-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { FaaHelpTip, FaaResourceLinks } from "@/components/certification/faa-help-tip";
import { FAA_RESOURCES } from "@/lib/data/faa-resources";
import { getAgeEligibilityTimeline } from "@/lib/settings/age-eligibility";
import type { Profile, StudentParentLink } from "@/types/models";
import {
  ChevronDown,
  Palette,
  Plane,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsContentProps {
  profile: Profile;
  linkedStudents: (StudentParentLink & { student?: Profile })[];
}

const SECTIONS = [
  { id: "personal", label: "Personal" },
  { id: "goals", label: "Training goals" },
  { id: "appearance", label: "Appearance" },
  { id: "account", label: "Account" },
];

export function SettingsContent({
  profile,
  linkedStudents,
}: SettingsContentProps) {
  const [name, setName] = useState(profile.name);
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? "");
  const [personalLoading, setPersonalLoading] = useState(false);

  const [homeAirport, setHomeAirport] = useState(profile.home_airport ?? "");
  const [careerGoal, setCareerGoal] = useState(profile.career_goal ?? "");
  const [targetAirline, setTargetAirline] = useState(
    profile.target_airline ?? ""
  );
  const [goalsLoading, setGoalsLoading] = useState(false);

  const [linkEmail, setLinkEmail] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  const [resourcesOpen, setResourcesOpen] = useState(false);

  const personalDirty =
    name !== profile.name || birthDate !== (profile.birth_date ?? "");
  const goalsDirty =
    homeAirport !== (profile.home_airport ?? "") ||
    careerGoal !== (profile.career_goal ?? "") ||
    targetAirline !== (profile.target_airline ?? "");

  const eligibility = useMemo(
    () => getAgeEligibilityTimeline(birthDate || null),
    [birthDate]
  );

  const sectionsForRole =
    profile.role === "parent"
      ? [...SECTIONS.slice(0, 3), { id: "students", label: "Students" }, SECTIONS[3]]
      : SECTIONS;

  async function handlePersonalSave() {
    setPersonalLoading(true);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("birth_date", birthDate);
    const result = await updateProfile(formData);
    setPersonalLoading(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Personal details saved");
  }

  async function handleGoalsSave() {
    setGoalsLoading(true);
    const formData = new FormData();
    formData.set("home_airport", homeAirport);
    formData.set("career_goal", careerGoal);
    formData.set("target_airline", targetAirline);
    const result = await updateProfile(formData);
    setGoalsLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Training goals saved");
      setHomeAirport((current) => current.trim().toUpperCase());
    }
  }

  async function handleLinkStudent() {
    if (!linkEmail) return;
    setLinkLoading(true);
    const result = await linkStudent(linkEmail);
    setLinkLoading(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Student linked");
      setLinkEmail("");
    }
  }

  async function handleUnlink(linkId: string) {
    const result = await unlinkStudent(linkId);
    if (result?.error) toast.error(result.error);
    else toast.success("Student unlinked");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and profile</p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {sectionsForRole.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <Card id="personal" className="scroll-mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-sky-600" />
            Personal details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfileAvatarUpload profile={profile} />

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="birth_date">Date of Birth</Label>
              <FaaHelpTip resource={FAA_RESOURCES.age_requirements} />
            </div>
            <Input
              id="birth_date"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Used to track FAA age requirements for certifications.{" "}
              <a
                href={FAA_RESOURCES.medical_exam.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline"
              >
                Medical certificate guide
              </a>
            </p>
          </div>

          {eligibility.length > 0 && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">FAA age eligibility</p>
              <ul className="space-y-1.5">
                {eligibility.map((item) => (
                  <li
                    key={item.milestone.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.milestone.name}
                      <span className="ml-1 text-xs">
                        (age {item.milestone.minimum_age})
                      </span>
                    </span>
                    {item.eligible ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 font-normal text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                      >
                        Eligible now
                      </Badge>
                    ) : (
                      <span className="shrink-0 font-medium">{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={handlePersonalSave} disabled={personalLoading || !personalDirty}>
            {personalDirty ? "Save changes" : "Saved"}
          </Button>
        </CardContent>
      </Card>

      <Card id="goals" className="scroll-mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-sky-600" />
            Training &amp; goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="home_airport">Home Airport</Label>
            <Input
              id="home_airport"
              placeholder="KORD"
              value={homeAirport}
              onChange={(event) =>
                setHomeAirport(event.target.value.toUpperCase())
              }
              maxLength={4}
            />
            <p className="text-xs text-muted-foreground">
              ICAO or IATA code (3-4 characters), e.g. KORD or ORD.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="career_goal">Career Goal</Label>
            <Textarea
              id="career_goal"
              placeholder="e.g. Fly for a major airline, become a CFI, or fly for fun."
              value={careerGoal}
              onChange={(event) => setCareerGoal(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_airline">Target Airline</Label>
            <Input
              id="target_airline"
              placeholder="United Airlines"
              value={targetAirline}
              onChange={(event) => setTargetAirline(event.target.value)}
            />
          </div>

          <Button onClick={handleGoalsSave} disabled={goalsLoading || !goalsDirty}>
            {goalsDirty ? "Save changes" : "Saved"}
          </Button>
        </CardContent>
      </Card>

      <Card id="appearance" className="scroll-mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-sky-600" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {profile.role === "parent" && (
        <Card id="students" className="scroll-mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-600" />
              Linked students
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkedStudents.length > 0 ? (
              <ul className="space-y-2">
                {linkedStudents.map((link) => (
                  <li
                    key={link.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{link.student?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {link.student?.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnlink(link.id)}
                    >
                      Unlink
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No students linked yet.
              </p>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Student email address"
                value={linkEmail}
                onChange={(event) => setLinkEmail(event.target.value)}
              />
              <Button onClick={handleLinkStudent} disabled={linkLoading}>
                Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AccountSecurityCard profile={profile} />

      <Card className="scroll-mt-6">
        <CardHeader className="pb-0">
          <button
            type="button"
            onClick={() => setResourcesOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-2"
            aria-expanded={resourcesOpen}
          >
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky-600" />
              Pilot resources
            </CardTitle>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                resourcesOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </CardHeader>
        {resourcesOpen && (
          <CardContent className="pt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Official FAA guides for training, medical certification, safety,
              and your rights as a pilot.
            </p>
            <FaaResourceLinks
              title="FAA links"
              resources={[
                FAA_RESOURCES.become_pilot,
                FAA_RESOURCES.medical_exam,
                FAA_RESOURCES.pilot_training,
                FAA_RESOURCES.pilot_safety,
                FAA_RESOURCES.pilot_rights,
              ]}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
