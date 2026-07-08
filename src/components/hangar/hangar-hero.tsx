"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FILE_CATEGORY_LABELS } from "@/types/models";
import type { FileCategory, HangarFile } from "@/types/models";
import { FolderOpen, Plus } from "lucide-react";

interface HangarHeroProps {
  files: HangarFile[];
  categoryCounts: Record<FileCategory, number>;
  isStudent: boolean;
  onUpload: () => void;
}

export function HangarHero({
  files,
  categoryCounts,
  isStudent,
  onUpload,
}: HangarHeroProps) {
  const latestFile = files[0] ?? null;
  const totalFiles = files.length;

  return (
    <Card className="border-sky-200 dark:border-sky-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-sky-600" />
            {latestFile ? "Latest Upload" : "Your Hangar"}
          </span>
          <Link
            href="/missions"
            className="text-sm font-normal text-sky-600 hover:underline"
          >
            View missions →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          {latestFile ? (
            <div className="min-w-0 space-y-1">
              <p className="text-xl font-semibold leading-snug">
                {latestFile.description?.trim() || latestFile.file_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {FILE_CATEGORY_LABELS[latestFile.category]} ·{" "}
                {format(new Date(latestFile.created_at), "MMMM d, yyyy")}
                <span className="ml-2 text-sky-700 dark:text-sky-300">
                  (
                  {formatDistanceToNow(new Date(latestFile.created_at), {
                    addSuffix: true,
                  })}
                  )
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {totalFiles} {totalFiles === 1 ? "file" : "files"} stored
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">No files yet</p>
              <p className="text-sm text-muted-foreground">
                Store certificates, photos, aircraft notes, and training documents.
              </p>
            </div>
          )}
          {isStudent && (
            <Button onClick={onUpload} className="hidden lg:inline-flex">
              <Plus className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          )}
        </div>

        {totalFiles > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {(Object.keys(FILE_CATEGORY_LABELS) as FileCategory[]).map(
              (category) =>
                categoryCounts[category] > 0 ? (
                  <span
                    key={category}
                    className="rounded-full border bg-muted/40 px-2.5 py-1"
                  >
                    {FILE_CATEGORY_LABELS[category]}: {categoryCounts[category]}
                  </span>
                ) : null
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
