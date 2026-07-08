"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JournalEntry, Mission } from "@/types/models";
import { Calendar, Pencil, Target, Trash2 } from "lucide-react";

interface JournalEntryDetailDialogProps {
  entry: JournalEntry | null;
  mission?: Mission | null;
  isStudent: boolean;
  loading: boolean;
  onClose: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
}

export function JournalEntryDetailDialog({
  entry,
  mission,
  isStudent,
  loading,
  onClose,
  onEdit,
  onDelete,
}: JournalEntryDetailDialogProps) {
  if (!entry) return null;

  return (
    <Dialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,640px)] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-3 border-b px-4 pt-4 pb-4 pr-12">
          <DialogTitle className="text-lg leading-snug">{entry.title}</DialogTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(entry.entry_date), "EEEE, MMMM d, yyyy")}
            </span>
            {mission && (
              <Badge variant="outline" className="gap-1 font-normal">
                <Target className="h-3 w-3" />
                <Link
                  href={`/missions?open=${mission.id}`}
                  className="hover:underline"
                >
                  {mission.title}
                </Link>
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {entry.content}
          </p>
        </div>

        {isStudent && (
          <DialogFooter className="mt-0 border-t px-4 py-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => onEdit(entry)}
                disabled={loading}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => onDelete(entry)}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
