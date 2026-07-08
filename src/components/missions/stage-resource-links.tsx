"use client";

import {
  FaaHelpLink,
  FaaHelpTip,
} from "@/components/certification/faa-help-tip";
import { getStageResources } from "@/lib/data/stage-guidance";
import { cn } from "@/lib/utils";

interface StageResourceLinksProps {
  stageName: string;
  title?: string;
  compact?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

export function StageResourceLinks({
  stageName,
  title = "Helpful resources",
  compact = false,
  className,
  onClick,
}: StageResourceLinksProps) {
  const resources = getStageResources(stageName);

  if (resources.length === 0) return null;

  return (
    <div
      className={cn(
        compact ? "space-y-1.5 border-t pt-3" : "space-y-2 border-t pt-3",
        className
      )}
      onClick={onClick}
    >
      {!compact && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      )}
      <ul className="space-y-1.5">
        {resources.map((resource) => (
          <li key={resource.milestoneId} className="flex items-start gap-1">
            <FaaHelpLink
              resource={resource}
              className={cn("text-xs", compact && "line-clamp-2")}
            />
            <FaaHelpTip resource={resource} />
          </li>
        ))}
      </ul>
    </div>
  );
}
