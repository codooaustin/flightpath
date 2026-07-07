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
import { createExpense, deleteExpense } from "@/lib/actions/expenses";
import {
  calculateExpensesByCategory,
  calculateTotalSpent,
  formatCurrency,
} from "@/lib/calculations/costs";
import { EXPENSE_CATEGORY_LABELS } from "@/types/models";
import type { Expense, ExpenseCategory } from "@/types/models";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
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

export function CostsContent({ expenses, isStudent }: CostsContentProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("flight_training");
  const [loading, setLoading] = useState(false);

  const totalSpent = calculateTotalSpent(expenses);
  const byCategory = calculateExpensesByCategory(expenses);
  const chartData = Object.entries(byCategory).map(([cat, amount]) => ({
    name: EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] ?? cat,
    amount,
  }));

  async function handleCreate(formData: FormData) {
    const receipt = formData.get("receipt") as File | null;
    const maxBytes = 9 * 1024 * 1024;

    if (receipt && receipt.size > maxBytes) {
      toast.error("Receipt must be 9 MB or smaller");
      return;
    }

    setLoading(true);
    formData.set("category", category);

    try {
      const result = await createExpense(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Expense added");
        setOpen(false);
      }
    } catch {
      toast.error("Failed to save expense. Try a smaller receipt or try again.");
    } finally {
      setLoading(false);
    }
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Expense</DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as ExpenseCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPENSE_CATEGORY_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt">Receipt (optional)</Label>
                  <Input id="receipt" name="receipt" type="file" />
                </div>
                <Button type="submit" disabled={loading}>
                  Add Expense
                </Button>
              </form>
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
                      {format(new Date(expense.date), "MMM d, yyyy")}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
