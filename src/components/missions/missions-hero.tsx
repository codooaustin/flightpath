"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MissionStatusBadge,
  getMissionSurfaceStyles,
} from "@/components/missions/mission-status-badge";
import { canAdvanceMissionStatus } from "@/lib/missions/mission-eligibility";
import type { Mission, MissionStatus, UserMission } from "@/types/models";
import { Plane } from "lucide-react";

interface MissionsHeroProps {
  nextMission: (UserMission & { mission?: Mission }) | null;
  birthDate: string | null;
  isStudent: boolean;
  loading: boolean;
  onOpenDetails: () => void;
  onStatusChange: (status: MissionStatus) => void;
}

export function MissionsHero({
  nextMission,
  birthDate,
  isStudent,
  loading,
  onOpenDetails,
  onStatusChange,
}: MissionsHeroProps) {
  const missionTitle = nextMission?.mission?.title ?? "";
  const canTakeOff =
    isStudent &&
    nextMission?.status === "available" &&
    canAdvanceMissionStatus(birthDate, missionTitle, "in_progress").allowed;
  const canLand =
    isStudent &&
    nextMission?.status === "in_progress" &&
    canAdvanceMissionStatus(birthDate, missionTitle, "completed").allowed;

  return (
    <Card
      className={getMissionSurfaceStyles(
        nextMission?.status ?? "locked",
        "border-sky-200 dark:border-sky-800"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-sky-600" />
            Next Mission
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
        {nextMission?.mission ? (
          <>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{nextMission.mission.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {nextMission.mission.description}
              </p>
              <MissionStatusBadge status={nextMission.status} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canTakeOff && (
                <Button
                  onClick={() => onStatusChange("in_progress")}
                  disabled={loading}
                >
                  Take Off
                </Button>
              )}
              {canLand && (
                <Button
                  onClick={() => onStatusChange("completed")}
                  disabled={loading}
                >
                  Land
                </Button>
              )}
              <Button variant="outline" onClick={onOpenDetails}>
                View details
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            All current missions landed — great work!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
