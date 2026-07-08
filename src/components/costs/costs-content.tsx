"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format, isSameMonth, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  DashboardFaaMobileButton,
  DashboardFaaSidebar,
} from "@/components/dashboard/dashboard-faa-sidebar";
import { CostsEmptyState } from "@/components/costs/costs-empty-state";
import { CostsHero } from "@/components/costs/costs-hero";
import { ExpenseDetailDialog } from "@/components/costs/expense-detail-dialog";
import { ExpenseForm } from "@/components/costs/expense-form";
import { deleteExpense } from "@/lib/actions/expenses";
import {
  calculateCategoryPercentages,
  calculateEstimatedRemaining,
  calculateExpensesByCategory,
  calculateTotalSpent,
  formatCurrency,
} from "@/lib/calculations/costs";
import { sumFlightHours } from "@/lib/calculations/flight-hours";
import { getCurrentStage } from "@/lib/calculations/progress";
import { getCostsGuidanceResources } from "@/lib/data/costs-guidance";
import { getStageResources } from "@/lib/data/stage-guidance";
import {
  EXPENSE_CATEGORY_BAR_CLASS,
  expenseCategoryBadgeClass,
} from "@/lib/costs/expense-styles";
import type { ExpenseTemplate } from "@/lib/costs/expense-templates";
import { formatDateOnly } from "@/lib/dates";
import { EXPENSE_CATEGORY_LABELS } from "@/types/models";
import type {
  Expense,
  ExpenseCategory,
  Flight,
  Mission,
  Stage,
  UserMission,
} from "@/types/models";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

type TimeFilter = "all" | "this_month";
type CategoryFilter = "all" | ExpenseCategory;

const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "this_month", label: "This month" },
];

interface CostsContentProps {
  expenses: Expense[];
  flights: Flight[];
  missions: Mission[];
  userMissions: (UserMission & { mission?: Mission })[];
  stages: Stage[];
  isStudent: boolean;
  initialOpenExpenseId?: string | null;
  initialOpenNew?: boolean;
}

function ExpenseListItem({
  expense,
  onSelect,
}: {
  expense: Expense;
  onSelect: (expense: Expense) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(expense)}
      className="flex w-full flex-col gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">
            {expense.description ?? EXPENSE_CATEGORY_LABELS[expense.category]}
          </p>
          <Badge
            variant="outline"
            className={expenseCategoryBadgeClass(expense.category)}
          >
            {EXPENSE_CATEGORY_LABELS[expense.category]}
          </Badge>
        </div>
        <p className="shrink-0 font-semibold">
          {formatCurrency(Number(expense.amount))}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        {formatDateOnly(expense.date)}
        {expense.receipt_url ? " · Receipt attached" : ""}
      </p>
    </button>
  );
}

function CategoryBreakdown({
  expenses,
}: {
  expenses: Expense[];
}) {
  const totalSpent = calculateTotalSpent(expenses);
  const byCategory = calculateExpensesByCategory(expenses);
  const percentages = calculateCategoryPercentages(byCategory, totalSpent);
  const rows = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">By category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([category, amount]) => {
          const cat = category as ExpenseCategory;
          const percent = percentages[category] ?? 0;
          return (
            <div key={category} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {EXPENSE_CATEGORY_LABELS[cat]}
                </span>
                <span className="font-medium">
                  {formatCurrency(amount)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({percent}%)
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    EXPENSE_CATEGORY_BAR_CLASS[cat]
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function CostsContent({
  expenses,
  flights,
  missions,
  userMissions,
  stages,
  isStudent,
  initialOpenExpenseId,
  initialOpenNew = false,
}: CostsContentProps) {
  const searchParams = useSearchParams();
  const currentStage = getCurrentStage(stages, missions, userMissions);

  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("flight_training");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [formDefaults, setFormDefaults] = useState<{
    amount?: number;
    description?: string;
  }>({});

  const totalSpent = calculateTotalSpent(expenses);
  const estimatedRemaining = calculateEstimatedRemaining(missions, userMissions);
  const totalHours = sumFlightHours(flights).total;

  const costsResources = getCostsGuidanceResources();
  const stageResources = currentStage
    ? getStageResources(currentStage.name)
    : [];
  const supplementalFaaResources = costsResources.filter(
    (resource) =>
      !stageResources.some(
        (existing) => existing.milestoneId === resource.milestoneId
      )
  );

  const usedCategories = useMemo(() => {
    const cats = new Set(expenses.map((e) => e.category));
    return (Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).filter(
      (cat) => cats.has(cat)
    );
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const monthStart = startOfMonth(new Date());

    return expenses.filter((expense) => {
      if (timeFilter === "this_month") {
        if (!isSameMonth(new Date(expense.date), monthStart)) return false;
      }
      if (categoryFilter !== "all" && expense.category !== categoryFilter) {
        return false;
      }
      if (!query) return true;
      const label = EXPENSE_CATEGORY_LABELS[expense.category].toLowerCase();
      return (
        label.includes(query) ||
        (expense.description?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [expenses, searchQuery, timeFilter, categoryFilter]);

  const groupedExpenses = useMemo(() => {
    const groups = new Map<string, Expense[]>();
    for (const expense of filteredExpenses) {
      const key = format(new Date(expense.date), "yyyy-MM");
      const list = groups.get(key) ?? [];
      list.push(expense);
      groups.set(key, list);
    }
    return [...groups.entries()].sort(([left], [right]) =>
      right.localeCompare(left)
    );
  }, [filteredExpenses]);

  useEffect(() => {
    if (initialOpenNew && isStudent) {
      setEditingExpense(null);
      setFormDefaults({});
      setFormOpen(true);
    }
  }, [initialOpenNew, isStudent]);

  useEffect(() => {
    const openId = initialOpenExpenseId ?? searchParams.get("open");
    if (!openId) return;
    const expense = expenses.find((item) => item.id === openId);
    if (expense) setSelectedExpense(expense);
  }, [initialOpenExpenseId, searchParams, expenses]);

  function handleFormDialogChange(nextOpen: boolean) {
    setFormOpen(nextOpen);
    if (!nextOpen) {
      setEditingExpense(null);
      setFormDefaults({});
      setCategory("flight_training");
    }
  }

  function openCreate(options?: {
    category?: ExpenseCategory;
    amount?: number;
    description?: string;
  }) {
    setEditingExpense(null);
    setCategory(options?.category ?? "flight_training");
    setFormDefaults({
      amount: options?.amount,
      description: options?.description,
    });
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setSelectedExpense(null);
    setEditingExpense(expense);
    setCategory(expense.category);
    setFormDefaults({});
    setFormOpen(true);
  }

  function openTemplate(template: ExpenseTemplate) {
    openCreate({
      category: template.category,
      amount: template.amount,
      description: template.description,
    });
  }

  async function handleDelete(expense: Expense) {
    if (
      !window.confirm(
        `Delete this ${formatCurrency(Number(expense.amount))} expense? This cannot be undone.`
      )
    ) {
      return;
    }
    setLoading(true);
    const result = await deleteExpense(expense.id);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Expense deleted");
      setSelectedExpense(null);
    }
  }

  const hasFilters =
    searchQuery.trim().length > 0 ||
    timeFilter !== "all" ||
    categoryFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Costs</h1>
          <p className="text-muted-foreground">
            Track your aviation training investment
          </p>
        </div>
        <DashboardFaaMobileButton
          resources={stageResources}
          supplemental={supplementalFaaResources}
        />
      </div>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          <CostsHero
            totalSpent={totalSpent}
            estimatedRemaining={estimatedRemaining}
            totalHours={totalHours}
            isStudent={isStudent}
            onAddExpense={() => openCreate()}
          />

          {expenses.length > 0 && <CategoryBreakdown expenses={expenses} />}

          {expenses.length > 0 && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {TIME_FILTERS.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      timeFilter === filter.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setTimeFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
                {usedCategories.length > 0 && (
                  <>
                    <span className="mx-1 hidden h-6 w-px bg-border sm:inline" />
                    <Button
                      variant={
                        categoryFilter === "all" ? "secondary" : "outline"
                      }
                      size="sm"
                      onClick={() => setCategoryFilter("all")}
                    >
                      All categories
                    </Button>
                    {usedCategories.map((cat) => (
                      <Button
                        key={cat}
                        variant={
                          categoryFilter === cat ? "secondary" : "outline"
                        }
                        size="sm"
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {EXPENSE_CATEGORY_LABELS[cat]}
                      </Button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {expenses.length === 0 ? (
            <CostsEmptyState
              isStudent={isStudent}
              onUseTemplate={openTemplate}
              onAddExpense={() => openCreate()}
            />
          ) : filteredExpenses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No expenses match your {hasFilters ? "filters" : "search"}.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-6 md:hidden">
                {groupedExpenses.map(([monthKey, monthExpenses]) => {
                  const monthDate = new Date(`${monthKey}-01T12:00:00`);
                  return (
                    <section key={monthKey} className="space-y-3">
                      <h2 className="text-sm font-medium text-muted-foreground">
                        {format(monthDate, "MMMM yyyy")}
                      </h2>
                      <div className="space-y-3">
                        {monthExpenses.map((expense) => (
                          <ExpenseListItem
                            key={expense.id}
                            expense={expense}
                            onSelect={setSelectedExpense}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              <Card className="hidden md:block">
                <CardHeader>
                  <CardTitle>Expense history</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow
                          key={expense.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedExpense(expense)}
                        >
                          <TableCell>
                            {formatDateOnly(expense.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={expenseCategoryBadgeClass(
                                expense.category
                              )}
                            >
                              {EXPENSE_CATEGORY_LABELS[expense.category]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {expense.description ?? "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number(expense.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DashboardFaaSidebar
          resources={stageResources}
          supplemental={supplementalFaaResources}
          defaultOpen
          storageKey="flightpath-costs-faa-sidebar"
        />
      </div>

      {isStudent && (
        <Button
          className="fixed bottom-6 right-6 z-40 shadow-lg lg:hidden"
          size="icon"
          onClick={() => openCreate()}
          aria-label="Add expense"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={formOpen} onOpenChange={handleFormDialogChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "New Expense"}
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            key={editingExpense?.id ?? `new-${formDefaults.description ?? ""}`}
            expense={editingExpense ?? undefined}
            category={category}
            setCategory={setCategory}
            defaultAmount={formDefaults.amount}
            defaultDescription={formDefaults.description}
            loading={loading}
            setLoading={setLoading}
            onSuccess={() => handleFormDialogChange(false)}
          />
        </DialogContent>
      </Dialog>

      <ExpenseDetailDialog
        expense={selectedExpense}
        isStudent={isStudent}
        loading={loading}
        onClose={() => setSelectedExpense(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
