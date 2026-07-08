"use client";

import { FaaResourceLinks } from "@/components/certification/faa-help-tip";
import { getMissionResources } from "@/lib/data/faa-resources";

interface MissionResourceLinksProps {
  missionTitle: string;
  title?: string;
}

export function MissionResourceLinks({
  missionTitle,
  title = "FAA resources",
}: MissionResourceLinksProps) {
  const resources = getMissionResources(missionTitle);

  return <FaaResourceLinks resources={resources} title={title} />;
}
