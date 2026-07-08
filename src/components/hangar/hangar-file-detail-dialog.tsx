"use client";

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
import {
  fileCategoryBadgeClass,
  getFileDisplayTitle,
  isImageFile,
} from "@/lib/hangar/file-styles";
import { FILE_CATEGORY_LABELS } from "@/types/models";
import type { FileCategory, HangarFile } from "@/types/models";
import { Calendar, Download, ExternalLink, FileIcon, Pencil, Trash2 } from "lucide-react";

interface HangarFileDetailDialogProps {
  file: HangarFile | null;
  isStudent: boolean;
  loading: boolean;
  onClose: () => void;
  onEdit: (file: HangarFile) => void;
  onDelete: (file: HangarFile) => void;
}

export function HangarFileDetailDialog({
  file,
  isStudent,
  loading,
  onClose,
  onEdit,
  onDelete,
}: HangarFileDetailDialogProps) {
  if (!file) return null;

  const showImage = isImageFile(file);

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2 pr-6">
            <DialogTitle className="leading-snug">
              {getFileDisplayTitle(file)}
            </DialogTitle>
            <Badge
              variant="outline"
              className={fileCategoryBadgeClass(file.category as FileCategory)}
            >
              {FILE_CATEGORY_LABELS[file.category]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(file.created_at), "EEEE, MMM d, yyyy")}
            </span>
            <span className="truncate">{file.file_name}</span>
          </div>
        </DialogHeader>

        {showImage ? (
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.file_url}
              alt={getFileDisplayTitle(file)}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-md bg-muted">
            <FileIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Document preview unavailable</p>
          </div>
        )}

        {file.description && (
          <p className="text-sm text-muted-foreground">{file.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <a
            href={file.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
          <a
            href={file.file_url}
            download={file.file_name}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>

        {isStudent && (
          <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(file)}
                disabled={loading}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit description
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => onDelete(file)}
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
