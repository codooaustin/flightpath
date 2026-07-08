import type { FileCategory } from "@/types/models";
import { cn } from "@/lib/utils";

export const FILE_CATEGORY_BADGE_CLASS: Record<FileCategory, string> = {
  certificates:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  photos:
    "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  aircraft:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
  equipment:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  documents:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
};

export function fileCategoryBadgeClass(category: FileCategory): string {
  return cn("font-normal", FILE_CATEGORY_BADGE_CLASS[category]);
}

export function getFileDisplayTitle(file: {
  file_name: string;
  description: string | null;
}): string {
  const description = file.description?.trim();
  return description || file.file_name;
}

export function isImageFile(file: { category: FileCategory; file_name: string }) {
  if (file.category === "photos") return true;
  return /\.(jpe?g|png|gif|webp)$/i.test(file.file_name);
}
