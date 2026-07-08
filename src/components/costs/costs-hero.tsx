"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import {
  calculateCostPerHour,
  formatCurrency,
} from "@/lib/calculations/costs";
import { formatHours } from "@/lib/calculations/flight-hours";
import { DollarSign, Plus } from "lucide-react";

interface CostsHeroProps {
  totalSpent: number;
  estimatedRemaining: number;
  totalHours: number;
  isStudent: boolean;
  onAddExpense: () => void;
}

export function CostsHero({
  totalSpent,
  estimatedRemaining,
  totalHours,
  isStudent,
  onAddExpense,
}: CostsHeroProps) {
  const projectedTotal = totalSpent + estimatedRemaining;
  const progressPercent =
    projectedTotal > 0
      ? Math.min(100, Math.round((totalSpent / projectedTotal) * 100))
      : 0;
  const costPerHour = calculateCostPerHour(totalSpent, totalHours);

  return (
    <Card className="border-sky-200 dark:border-sky-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-sky-600" />
            Training Investment
          </span>
          <Link
            href="/missions"
            className="text-sm font-normal text-sky-600 hover:underline"
          >
            View missions →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. remaining</p>
              <p className="text-2xl font-bold">
                {formatCurrency(estimatedRemaining)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Projected total</p>
              <p className="text-2xl font-bold">
                {formatCurrency(projectedTotal)}
              </p>
            </div>
          </div>
          {isStudent && (
            <Button onClick={onAddExpense} className="hidden lg:inline-flex">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          )}
        </div>

        {projectedTotal > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget progress</span>
              <span className="font-medium">{progressPercent}% spent</span>
            </div>
            <FlightProgress value={progressPercent} />
          </div>
        )}

        {costPerHour != null && (
          <p className="text-sm text-muted-foreground">
            Average cost per hour:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(costPerHour)}
            </span>{" "}
            across {formatHours(totalHours)} logged
          </p>
        )}
      </CardContent>
    </Card>
  );
}
