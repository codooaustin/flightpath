import {
  getAge,
  getEligibilityDate,
  getPilotMilestones,
  isAgeEligible,
  type PilotMilestone,
} from "@/lib/calculations/certification";
import { format } from "date-fns";

export interface AgeEligibilityItem {
  milestone: PilotMilestone;
  eligible: boolean;
  eligibilityDate: Date | null;
  label: string;
}

export function getAgeEligibilityTimeline(
  birthDate: string | null
): AgeEligibilityItem[] {
  if (!birthDate) return [];

  const age = getAge(birthDate);

  return getPilotMilestones()
    .filter((milestone) => milestone.minimum_age > 0)
    .sort((a, b) => a.minimum_age - b.minimum_age)
    .map((milestone) => {
      const eligible = isAgeEligible(age, milestone);
      const eligibilityDate = getEligibilityDate(
        birthDate,
        milestone.minimum_age
      );
      return {
        milestone,
        eligible,
        eligibilityDate,
        label: eligible
          ? "Eligible now"
          : format(eligibilityDate, "MMM d, yyyy"),
      };
    });
}
