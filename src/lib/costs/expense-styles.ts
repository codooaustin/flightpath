import type { ExpenseCategory } from "@/types/models";
import { cn } from "@/lib/utils";

export const EXPENSE_CATEGORY_BADGE_CLASS: Record<ExpenseCategory, string> = {
  flight_training:
    "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  books:
    "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
  equipment:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  medical:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
  tests:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  travel:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
};

export const EXPENSE_CATEGORY_BAR_CLASS: Record<ExpenseCategory, string> = {
  flight_training: "bg-sky-600",
  books: "bg-violet-500",
  equipment: "bg-amber-500",
  medical: "bg-rose-500",
  tests: "bg-emerald-600",
  travel: "bg-orange-500",
};

export function expenseCategoryBadgeClass(category: ExpenseCategory): string {
  return cn("font-normal", EXPENSE_CATEGORY_BADGE_CLASS[category]);
}
