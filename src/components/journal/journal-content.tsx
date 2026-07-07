"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createJournalEntry,
  deleteJournalEntry,
} from "@/lib/actions/journal";
import type { JournalEntry, Mission } from "@/types/models";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface JournalContentProps {
  entries: JournalEntry[];
  missions: Mission[];
  isStudent: boolean;
}

export function JournalContent({
  entries,
  missions,
  isStudent,
}: JournalContentProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [missionId, setMissionId] = useState("none");

  async function handleCreate(formData: FormData) {
    setLoading(true);
    formData.set("mission_id", missionId);
    const result = await createJournalEntry(formData);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Entry created");
      setOpen(false);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteJournalEntry(id);
    if (result?.error) toast.error(result.error);
    else toast.success("Entry deleted");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground">
            Capture your thoughts and milestones
          </p>
        </div>
        {isStudent && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry_date">Date</Label>
                  <Input
                    id="entry_date"
                    name="entry_date"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Related Mission (optional)</Label>
                  <Select value={missionId} onValueChange={(v) => v && setMissionId(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {missions.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" name="content" rows={6} required />
                </div>
                <Button type="submit" disabled={loading}>
                  Save Entry
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{entry.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(entry.entry_date), "MMMM d, yyyy")}
                </p>
              </div>
              {isStudent && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{entry.content}</p>
            </CardContent>
          </Card>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-muted-foreground">
            No journal entries yet. Start documenting your aviation journey.
          </p>
        )}
      </div>
    </div>
  );
}
