import { format } from "date-fns";

/** Parse YYYY-MM-DD (or ISO datetime prefix) as a local calendar date. */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateOnly(value: string, pattern = "MMM d, yyyy"): string {
  return format(parseDateOnly(value), pattern);
}

export function toDateInputValue(value: string): string {
  return value.split("T")[0];
}
