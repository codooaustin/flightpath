"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignOutButton } from "@/components/sign-out-button";
import { changePassword } from "@/lib/actions/auth";
import type { Profile } from "@/types/models";
import { KeyRound, Mail, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";

interface AccountSecurityCardProps {
  profile: Profile;
}

export function AccountSecurityCard({ profile }: AccountSecurityCardProps) {
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleChangePassword(formData: FormData) {
    setLoading(true);
    const result = await changePassword(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Password updated");
      setFormKey((key) => key + 1);
    }
  }

  return (
    <Card id="account">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-600" />
          Account &amp; security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email</span>
            <span className="ml-auto font-medium">{profile.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <UserCog className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Role</span>
            <span className="ml-auto font-medium capitalize">
              {profile.role}
            </span>
          </div>
        </div>

        <form
          key={formKey}
          action={handleChangePassword}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Change password</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new_password">New password</Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Use at least 8 characters.
          </p>
          <Button type="submit" variant="outline" disabled={loading}>
            Update password
          </Button>
        </form>

        <div className="border-t pt-4">
          <SignOutButton />
        </div>
      </CardContent>
    </Card>
  );
}
