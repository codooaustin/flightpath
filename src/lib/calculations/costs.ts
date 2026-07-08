import type { Expense, Mission, UserMission } from "@/types/models";

export function calculateTotalSpent(expenses: Expense[]) {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

export function calculateExpensesByCategory(expenses: Expense[]) {
  return expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + Number(expense.amount);
    return acc;
  }, {});
}

export function calculateEstimatedRemaining(
  missions: Mission[],
  userMissions: UserMission[]
) {
  const incompleteMissionIds = new Set(
    userMissions
      .filter((um) => um.status !== "completed")
      .map((um) => um.mission_id)
  );

  return missions
    .filter((m) => incompleteMissionIds.has(m.id))
    .reduce((sum, m) => sum + Number(m.estimated_cost ?? 0), 0);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateCostPerHour(
  totalSpent: number,
  totalHours: number
): number | null {
  if (totalHours <= 0) return null;
  return totalSpent / totalHours;
}

export function calculateCategoryPercentages(
  byCategory: Record<string, number>,
  totalSpent: number
): Record<string, number> {
  if (totalSpent <= 0) return {};
  return Object.fromEntries(
    Object.entries(byCategory).map(([category, amount]) => [
      category,
      Math.round((amount / totalSpent) * 100),
    ])
  );
}
