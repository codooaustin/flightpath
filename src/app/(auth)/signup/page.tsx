"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlaneTakeoff } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("role", role);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Start your flight path"
      subtitle="Create an account and plot your course from first lesson to captain."
      footer={
        <>
          Already flying with us?{" "}
          <Link href="/login" className="font-medium text-sky-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form action={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Alex Morgan"
            autoComplete="name"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="captain@flightpath.app"
            autoComplete="email"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label>I am a...</Label>
          <Select value={role} onValueChange={(v) => v && setRole(v)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student Pilot</SelectItem>
              <SelectItem value="parent">Parent / Mentor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="h-11 w-full gap-2 bg-sky-600 text-white hover:bg-sky-700"
          disabled={loading}
        >
          {loading ? (
            "Preparing for departure..."
          ) : (
            <>
              <PlaneTakeoff className="h-4 w-4" />
              Create account
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
