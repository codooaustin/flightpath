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
import { expenseCategoryBadgeClass } from "@/lib/costs/expense-styles";
import { formatCurrency } from "@/lib/calculations/costs";
import { EXPENSE_CATEGORY_LABELS } from "@/types/models";
import type { Expense, ExpenseCategory } from "@/types/models";
import { Calendar, ExternalLink, Pencil, Trash2 } from "lucide-react";

interface ExpenseDetailDialogProps {
  expense: Expense | null;
  isStudent: boolean;
  loading: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseDetailDialog({
  expense,
  isStudent,
  loading,
  onClose,
  onEdit,
  onDelete,
}: ExpenseDetailDialogProps) {
  if (!expense) return null;

  return (
    <Dialog open={!!expense} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2 pr-6">
            <DialogTitle>
              {expense.description ?? EXPENSE_CATEGORY_LABELS[expense.category]}
            </DialogTitle>
            <Badge
              variant="outline"
              className={expenseCategoryBadgeClass(expense.category as ExpenseCategory)}
            >
              {EXPENSE_CATEGORY_LABELS[expense.category]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(expense.date), "EEEE, MMM d, yyyy")}
            </span>
            <span className="text-lg font-semibold text-foreground">
              {formatCurrency(Number(expense.amount))}
            </span>
          </div>
        </DialogHeader>

        {expense.receipt_url && (
          <a
            href={expense.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:underline"
          >
            View receipt
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {isStudent && (
          <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => onEdit(expense)}
                disabled={loading}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => onDelete(expense)}
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
