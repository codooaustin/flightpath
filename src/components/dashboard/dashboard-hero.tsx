import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlightProgress } from "@/components/dashboard/flight-progress";
import { FaaHelpLink } from "@/components/certification/faa-help-tip";
import {
  MissionStatusBadge,
  getMissionSurfaceStyles,
} from "@/components/missions/mission-status-badge";
import { getMissionResources } from "@/lib/data/faa-resources";
import type { Mission, Stage, UserMission } from "@/types/models";
import { Plane, Target } from "lucide-react";

interface DashboardHeroProps {
  currentStage: Stage | null;
  progress: { completed: number; total: number; percentage: number };
  nextMission: (UserMission & { mission?: Mission }) | null;
}

export function DashboardHero({
  currentStage,
  progress,
  nextMission,
}: DashboardHeroProps) {
  const primaryResource = nextMission?.mission
    ? getMissionResources(nextMission.mission.title)[0]
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card
        className={getMissionSurfaceStyles(
          nextMission?.status ?? "locked",
          "lg:col-span-2"
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky-600" />
              Next Mission
            </span>
            <Link
              href="/missions"
              className="text-sm font-normal text-sky-600 hover:underline"
            >
              View missions →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextMission?.mission ? (
            <div className="space-y-3">
              <Link href="/missions" className="block space-y-2 hover:opacity-90">
                <p className="text-lg font-semibold">{nextMission.mission.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {nextMission.mission.description}
                </p>
                <MissionStatusBadge status={nextMission.status} />
              </Link>
              {primaryResource && (
                <div className="flex items-start gap-1 border-t pt-3">
                  <FaaHelpLink resource={primaryResource} className="text-xs line-clamp-1" />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">All missions landed!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5 text-sky-600" />
              Current Stage
            </span>
            <Link
              href="/roadmap"
              className="text-sm font-normal text-sky-600 hover:underline"
            >
              View roadmap →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-semibold">
                {currentStage?.name ?? "Getting Started"}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {currentStage?.description}
              </p>
            </div>
            <Badge variant="secondary">{progress.percentage}%</Badge>
          </div>
          <FlightProgress value={progress.percentage} />
          <p className="text-sm text-muted-foreground">
            {progress.completed} of {progress.total} missions landed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
