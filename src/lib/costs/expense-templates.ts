import type { ExpenseCategory } from "@/types/models";

export interface ExpenseTemplate {
  category: ExpenseCategory;
  amount?: number;
  description: string;
  label: string;
}

export const EXPENSE_TEMPLATES: ExpenseTemplate[] = [
  {
    label: "Discovery flight",
    category: "flight_training",
    amount: 200,
    description: "Introductory flight lesson",
  },
  {
    label: "Medical exam",
    category: "medical",
    amount: 150,
    description: "AME examination fee",
  },
  {
    label: "Written knowledge test",
    category: "tests",
    amount: 175,
    description: "FAA knowledge exam",
  },
  {
    label: "Headset / equipment",
    category: "equipment",
    description: "Training equipment purchase",
  },
];
