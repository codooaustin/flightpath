"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HANGAR_UPLOAD_TEMPLATES,
  type HangarUploadTemplate,
} from "@/lib/hangar/upload-templates";
import { fileCategoryBadgeClass } from "@/lib/hangar/file-styles";
import { FILE_CATEGORY_LABELS } from "@/types/models";
import type { FileCategory } from "@/types/models";
import { FolderOpen, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATE_BUTTON_CLASS =
  "h-auto min-w-0 w-full shrink whitespace-normal flex-col items-stretch gap-1 py-3 text-left";

interface HangarEmptyStateProps {
  category: FileCategory | "all";
  isStudent: boolean;
  missionSuggestion?: HangarUploadTemplate | null;
  onUseTemplate: (template: HangarUploadTemplate) => void;
  onUpload: () => void;
}

export function HangarEmptyState({
  category,
  isStudent,
  missionSuggestion,
  onUseTemplate,
  onUpload,
}: HangarEmptyStateProps) {
  const templates = HANGAR_UPLOAD_TEMPLATES[category];

  if (!isStudent) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No files in this category yet.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed p-4">
      <div className="space-y-1 text-center">
        <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="font-medium">
          {category === "all"
            ? "Start building your digital hangar"
            : `No ${FILE_CATEGORY_LABELS[category as FileCategory].toLowerCase()} yet`}
        </p>
        <p className="text-sm text-muted-foreground">
          Upload certificates, photos, and documents to keep your training organized.
        </p>
      </div>

      {missionSuggestion && (
        <Button
          variant="secondary"
          className="h-auto min-w-0 w-full whitespace-normal flex-col items-stretch gap-1 py-3 text-left"
          onClick={() => onUseTemplate(missionSuggestion)}
        >
          <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
            Suggested for your next mission
          </span>
          <span className="font-medium leading-snug">{missionSuggestion.label}</span>
          <span className="text-xs font-normal text-muted-foreground leading-snug">
            {missionSuggestion.description}
          </span>
        </Button>
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Button
            key={`${template.category}-${template.label}`}
            variant="outline"
            className={TEMPLATE_BUTTON_CLASS}
            onClick={() => onUseTemplate(template)}
          >
            <Badge
              variant="outline"
              className={fileCategoryBadgeClass(template.category)}
            >
              {FILE_CATEGORY_LABELS[template.category]}
            </Badge>
            <span className="font-medium leading-snug">{template.label}</span>
            <span
              className={cn(
                "text-xs leading-snug font-normal text-muted-foreground",
                "line-clamp-2"
              )}
            >
              {template.description}
            </span>
          </Button>
        ))}
      </div>

      <Button className="w-full" onClick={onUpload}>
        <Upload className="mr-2 h-4 w-4" />
        Upload custom file
      </Button>
    </div>
  );
}
