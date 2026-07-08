import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { formatHours } from "@/lib/calculations/flight-hours";
import { getStageTrainingDisplay } from "@/lib/data/stage-guidance";
import type { Stage } from "@/types/models";
import { Clock, Plus } from "lucide-react";

interface LogbookHeroProps {
  currentStage: Stage | null;
  hourTotals: FlightHourTotals;
  isStudent: boolean;
  onLogFlight: () => void;
}

export function LogbookHero({
  currentStage,
  hourTotals,
  isStudent,
  onLogFlight,
}: LogbookHeroProps) {
  const display = currentStage
    ? getStageTrainingDisplay(currentStage.name, hourTotals)
    : null;
  const hourAccrual = display?.hourAccrual ?? null;
  const hoursRemaining =
    hourAccrual != null
      ? Math.max(0, hourAccrual.primary.target - hourAccrual.primary.current)
      : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-600" />
            Hour Progress
            {currentStage && (
              <span className="text-sm font-normal text-muted-foreground">
                · {currentStage.name}
              </span>
            )}
          </span>
          <Link
            href="/roadmap"
            className="text-sm font-normal text-sky-600 hover:underline"
          >
            View roadmap →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-bold">{formatHours(hourTotals.total)}</p>
            <p className="text-sm text-muted-foreground">Total logged hours</p>
          </div>
          {isStudent && (
            <Button onClick={onLogFlight} className="hidden lg:inline-flex">
              <Plus className="mr-2 h-4 w-4" />
              Log Flight
            </Button>
          )}
        </div>

        {hourAccrual ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {hourAccrual.primary.label}
              </span>
              <span className="font-medium">
                {formatHours(hourAccrual.primary.current)} /{" "}
                {formatHours(hourAccrual.primary.target)} hrs
              </span>
            </div>
            <FlightProgress value={hourAccrual.primary.percent} />
            {hoursRemaining != null && hoursRemaining > 0 ? (
              <p className="text-sm text-muted-foreground">
                {formatHours(hoursRemaining)} hrs to typical training target
              </p>
            ) : hourAccrual.note ? (
              <p className="text-sm text-muted-foreground">{hourAccrual.note}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Advance on the roadmap to unlock stage-specific hour targets.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
