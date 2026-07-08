"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EXPENSE_TEMPLATES,
  type ExpenseTemplate,
} from "@/lib/costs/expense-templates";
import { expenseCategoryBadgeClass } from "@/lib/costs/expense-styles";
import { EXPENSE_CATEGORY_LABELS } from "@/types/models";
import { Receipt, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATE_BUTTON_CLASS =
  "h-auto min-w-0 w-full shrink whitespace-normal flex-col items-stretch gap-1 py-3 text-left";

interface CostsEmptyStateProps {
  isStudent: boolean;
  onUseTemplate: (template: ExpenseTemplate) => void;
  onAddExpense: () => void;
}

export function CostsEmptyState({
  isStudent,
  onUseTemplate,
  onAddExpense,
}: CostsEmptyStateProps) {
  if (!isStudent) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No expenses recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-dashed p-4">
      <div className="space-y-1 text-center">
        <Wallet className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Start tracking your training costs</p>
        <p className="text-sm text-muted-foreground">
          Log flights, medical fees, tests, and equipment purchases.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {EXPENSE_TEMPLATES.map((template) => (
          <Button
            key={template.label}
            variant="outline"
            className={TEMPLATE_BUTTON_CLASS}
            onClick={() => onUseTemplate(template)}
          >
            <Badge
              variant="outline"
              className={expenseCategoryBadgeClass(template.category)}
            >
              {EXPENSE_CATEGORY_LABELS[template.category]}
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

      <Button className="w-full" onClick={onAddExpense}>
        <Receipt className="mr-2 h-4 w-4" />
        Add custom expense
      </Button>
    </div>
  );
}
