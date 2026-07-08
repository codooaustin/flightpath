import type { EventType } from "@/types/models";
import { cn } from "@/lib/utils";

export const EVENT_TYPE_DOT_CLASS: Record<EventType, string> = {
  flight: "bg-sky-600",
  study: "bg-violet-500",
  test: "bg-amber-500",
  medical: "bg-rose-500",
  checkride: "bg-emerald-600",
  scholarship: "bg-orange-500",
};

export const EVENT_TYPE_BADGE_CLASS: Record<EventType, string> = {
  flight: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  study:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
  test: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  medical:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
  checkride:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  scholarship:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
};

export function eventTypeBadgeClass(type: EventType): string {
  return cn("font-normal", EVENT_TYPE_BADGE_CLASS[type]);
}
