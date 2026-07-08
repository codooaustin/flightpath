import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import { formatHours } from "@/lib/calculations/flight-hours";
import {
  formatAgeEligibility,
  type PilotMilestone,
} from "@/lib/calculations/certification";
import { Award } from "lucide-react";

interface DashboardTrainingProgressProps {
  totalHours: number;
  nextMilestone: PilotMilestone | null;
  milestoneTarget: number | null;
  milestoneProgress: number;
  nextAchievement: { target: number; remaining: number } | null;
  careerMarker: {
    current: { name: string };
    next: { name: string } | null;
  };
  age: number | null;
  birthDate: string | null;
  instrumentProgress: {
    instrument: { current: number; target: number; percent: number };
    crossCountryPic: { current: number; target: number; percent: number };
  } | null;
}

export function DashboardTrainingProgress({
  totalHours,
  nextMilestone,
  milestoneTarget,
  milestoneProgress,
  nextAchievement,
  careerMarker,
  age,
  birthDate,
  instrumentProgress,
}: DashboardTrainingProgressProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5 text-sky-600" />
            Training Progress
          </span>
          <Link
            href="/logbook"
            className="text-sm font-normal text-sky-600 hover:underline"
          >
            Log a flight →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-bold">{formatHours(totalHours)}</p>
          <p className="text-sm text-muted-foreground">Total logged hours</p>
        </div>

        {nextMilestone && milestoneTarget != null ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Next: {nextMilestone.name}
              </span>
              <span className="font-medium">
                {formatHours(totalHours)} / {milestoneTarget} hrs
              </span>
            </div>
            <FlightProgress value={milestoneProgress} />
            <p className="text-sm text-muted-foreground line-clamp-2">
              {nextMilestone.description}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            All tracked certification hour targets met.
          </p>
        )}

        {nextAchievement && (
          <Badge variant="secondary">
            {nextAchievement.target} hrs —{" "}
            {formatHours(nextAchievement.remaining)} to go
          </Badge>
        )}

        <p className="text-xs text-muted-foreground">
          {careerMarker.current.name}
          {careerMarker.next ? ` · Next: ${careerMarker.next.name}` : ""}
        </p>

        <div className="space-y-1 border-t pt-3">
          {age != null ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Age: </span>
              <span className="font-medium">{age} years</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add your birthday in{" "}
              <Link href="/settings" className="text-sky-600 hover:underline">
                Settings
              </Link>{" "}
              to track age requirements.
            </p>
          )}
          {nextMilestone && (
            <p className="text-sm text-muted-foreground">
              {formatAgeEligibility(birthDate, nextMilestone)}
            </p>
          )}
        </div>

        {instrumentProgress && (
          <div className="space-y-3 border-t pt-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>Instrument hours</span>
                <span>
                  {formatHours(instrumentProgress.instrument.current)} /{" "}
                  {instrumentProgress.instrument.target}
                </span>
              </div>
              <Progress
                value={instrumentProgress.instrument.percent}
                className="h-1.5"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>PIC cross-country (approx.)</span>
                <span>
                  {formatHours(instrumentProgress.crossCountryPic.current)} /{" "}
                  {instrumentProgress.crossCountryPic.target}
                </span>
              </div>
              <Progress
                value={instrumentProgress.crossCountryPic.percent}
                className="h-1.5"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
