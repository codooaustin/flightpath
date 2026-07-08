"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/lib/actions/expenses";
import {
  calculateExpensesByCategory,
  calculateTotalSpent,
  formatCurrency,
} from "@/lib/calculations/costs";
import { formatDateOnly, toDateInputValue } from "@/lib/dates";
import { EXPENSE_CATEGORY_LABELS } from "@/types/models";
import type { Expense, ExpenseCategory } from "@/types/models";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CostsContentProps {
  expenses: Expense[];
  isStudent: boolean;
}

function ExpenseForm({
  expense,
  category,
  setCategory,
  loading,
  setLoading,
  onSuccess,
}: {
  expense?: Expense;
  category: ExpenseCategory;
  setCategory: (category: ExpenseCategory) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}) {
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
            <SelectValue />
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
          defaultValue={expense?.amount ?? ""}
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
          defaultValue={expense?.description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="receipt">Receipt (optional)</Label>
        <Input id="receipt" name="receipt" type="file" />
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

export function CostsContent({ expenses, isStudent }: CostsContentProps) {
  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>("flight_training");
  const [loading, setLoading] = useState(false);

  const totalSpent = calculateTotalSpent(expenses);
  const byCategory = calculateExpensesByCategory(expenses);
  const chartData = Object.entries(byCategory).map(([cat, amount]) => ({
    name: EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat,
    amount,
  }));

  function handleDialogChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEditingExpense(null);
      setCategory("flight_training");
    }
  }

  function openCreate() {
    setEditingExpense(null);
    setCategory("flight_training");
    setOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setCategory(expense.category);
    setOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteExpense(id);
    if (result?.error) toast.error(result.error);
    else toast.success("Expense deleted");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Costs</h1>
          <p className="text-muted-foreground">
            Track your aviation training investment
          </p>
        </div>
        {isStudent && (
          <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger
              render={
                <Button onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? "Edit Expense" : "New Expense"}
                </DialogTitle>
              </DialogHeader>
              <ExpenseForm
                key={editingExpense?.id ?? "new"}
                expense={editingExpense ?? undefined}
                category={category}
                setCategory={setCategory}
                loading={loading}
                setLoading={setLoading}
                onSuccess={() => handleDialogChange(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">By Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Bar dataKey="amount" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                No expenses recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {isStudent && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {formatDateOnly(expense.date)}
                    </TableCell>
                    <TableCell>
                      {EXPENSE_CATEGORY_LABELS[expense.category]}
                    </TableCell>
                    <TableCell>{expense.description ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(expense.amount))}
                    </TableCell>
                    {isStudent && (
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(expense)}
                            aria-label={`Edit expense from ${formatDateOnly(expense.date)}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense.id)}
                            aria-label={`Delete expense from ${formatDateOnly(expense.date)}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No expenses yet. Add your first training cost.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
