"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createJournalEntry,
  updateJournalEntry,
} from "@/lib/actions/journal";
import type { JournalEntry, Mission, UserMission } from "@/types/models";
import { toast } from "sonner";

const WRITING_PROMPTS = [
  "What went well?",
  "What would you do differently?",
  "What do you want to remember?",
] as const;

interface JournalEntryFormProps {
  entry?: JournalEntry;
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  missionId: string;
  setMissionId: (id: string) => void;
  defaultTitle?: string;
  defaultContent?: string;
  defaultDate?: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

export function JournalEntryForm({
  entry,
  missions,
  userMissions,
  missionId,
  setMissionId,
  defaultTitle,
  defaultContent,
  defaultDate,
  loading,
  setLoading,
  onSuccess,
}: JournalEntryFormProps) {
  const missionMap = useMemo(
    () => new Map(missions.map((mission) => [mission.id, mission])),
    [missions]
  );

  const activeMissions = useMemo(
    () =>
      userMissions.filter(
        (um) =>
          (um.status === "in_progress" || um.status === "available") &&
          um.mission
      ),
    [userMissions]
  );

  const otherMissions = useMemo(
    () =>
      userMissions.filter(
        (um) =>
          um.status !== "in_progress" &&
          um.status !== "available" &&
          um.mission
      ),
    [userMissions]
  );

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("mission_id", missionId);

    const result = entry
      ? await updateJournalEntry(entry.id, formData)
      : await createJournalEntry(formData);

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(entry ? "Entry updated" : "Entry created");
    onSuccess();
  }

  const selectedMissionTitle =
    missionId !== "none" ? missionMap.get(missionId)?.title : null;

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={entry?.title ?? defaultTitle ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="entry_date">Date</Label>
        <Input
          id="entry_date"
          name="entry_date"
          type="date"
          defaultValue={
            entry?.entry_date ??
            defaultDate ??
            new Date().toISOString().split("T")[0]
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Related mission (optional)</Label>
        <Select value={missionId} onValueChange={(v) => v && setMissionId(v)}>
          <SelectTrigger>
            <SelectValue placeholder="None">
              {selectedMissionTitle ?? "None"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {activeMissions.length > 0 && (
              <SelectGroup>
                <SelectLabel>Active missions</SelectLabel>
                {activeMissions.map((um) => (
                  <SelectItem key={um.mission_id} value={um.mission_id}>
                    {um.mission!.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            {otherMissions.length > 0 && (
              <SelectGroup>
                <SelectLabel>Other missions</SelectLabel>
                {otherMissions.map((um) => (
                  <SelectItem key={um.mission_id} value={um.mission_id}>
                    {um.mission!.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          rows={10}
          defaultValue={entry?.content ?? defaultContent ?? ""}
          required
          className="min-h-[200px]"
        />
        <p className="text-xs text-muted-foreground">
          Prompts: {WRITING_PROMPTS.join(" · ")}
        </p>
      </div>
      <Button type="submit" disabled={loading}>
        {entry ? "Save Changes" : "Save Entry"}
      </Button>
    </form>
  );
}
