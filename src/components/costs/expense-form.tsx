"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import { EXPENSE_CATEGORY_LABELS } from "@/types/models";
import type { Expense, ExpenseCategory } from "@/types/models";
import { toast } from "sonner";
import { toDateInputValue } from "@/lib/dates";

interface ExpenseFormProps {
  expense?: Expense;
  category: ExpenseCategory;
  setCategory: (category: ExpenseCategory) => void;
  defaultAmount?: number;
  defaultDescription?: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

export function ExpenseForm({
  expense,
  category,
  setCategory,
  defaultAmount,
  defaultDescription,
  loading,
  setLoading,
  onSuccess,
}: ExpenseFormProps) {
  async function handleSubmit(formData: FormData) {
    const receipt = formData.get("receipt") as File | null;
    const maxBytes = 9 * 1024 * 1024;

    if (receipt && receipt.size > maxBytes) {
      toast.error("Receipt must be 9 MB or smaller");
      return;
    }

    setLoading(true);
    formData.set("category", category);

    try {
      const result = expense
        ? await updateExpense(expense.id, formData)
        : await createExpense(formData);

      if (result?.error) toast.error(result.error);
      else {
        toast.success(expense ? "Expense updated" : "Expense added");
        onSuccess();
      }
    } catch {
      toast.error("Failed to save expense. Try a smaller receipt or try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as ExpenseCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category">
              {EXPENSE_CATEGORY_LABELS[category]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={expense?.amount ?? defaultAmount ?? ""}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={
            expense?.date
              ? toDateInputValue(expense.date)
              : new Date().toISOString().split("T")[0]
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={expense?.description ?? defaultDescription ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="receipt">Receipt (optional)</Label>
        <Input id="receipt" name="receipt" type="file" accept="image/*,.pdf" />
        <p className="text-xs text-muted-foreground">Max file size: 9 MB</p>
        {expense?.receipt_url && (
          <p className="text-xs text-muted-foreground">
            Current receipt on file. Upload a new file to replace it.
          </p>
        )}
      </div>
      <Button type="submit" disabled={loading}>
        {expense ? "Save Changes" : "Add Expense"}
      </Button>
    </form>
  );
}
