"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile, linkStudent, unlinkStudent } from "@/lib/actions/auth";
import { SignOutButton } from "@/components/sign-out-button";
import type { Profile, StudentParentLink } from "@/types/models";
import { toast } from "sonner";

interface SettingsContentProps {
  profile: Profile;
  linkedStudents: (StudentParentLink & { student?: Profile })[];
}

export function SettingsContent({
  profile,
  linkedStudents,
}: SettingsContentProps) {
  const [loading, setLoading] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");

  async function handleProfileUpdate(formData: FormData) {
    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Profile updated");
  }

  async function handleLinkStudent() {
    if (!linkEmail) return;
    setLoading(true);
    const result = await linkStudent(linkEmail);
    setLoading(false);
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

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="home_airport">Home Airport</Label>
              <Input
                id="home_airport"
                name="home_airport"
                placeholder="KORD"
                defaultValue={profile.home_airport ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="career_goal">Career Goal</Label>
              <Textarea
                id="career_goal"
                name="career_goal"
                defaultValue={profile.career_goal ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_airline">Target Airline</Label>
              <Input
                id="target_airline"
                name="target_airline"
                placeholder="United Airlines"
                defaultValue={profile.target_airline ?? ""}
              />
            </div>
            <Button type="submit" disabled={loading}>
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile.role === "parent" && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Students</CardTitle>
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
                onChange={(e) => setLinkEmail(e.target.value)}
              />
              <Button onClick={handleLinkStudent} disabled={loading}>
                Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Signed in as {profile.email}
          </p>
          <p className="text-sm capitalize text-muted-foreground">
            Role: {profile.role}
          </p>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
