import milestonesData from "@/lib/data/pilot-milestones.json";
import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import { differenceInMonths, format } from "date-fns";

export interface PilotMilestone {
  id: string;
  name: string;
  minimum_age: number;
  faa_minimum_hours: number | null;
  typical_hours_range: number[];
  track_progress: boolean;
  description: string;
  additional_requirements?: {
    cross_country_pic_hours: number;
    instrument_hours: number;
  };
}

export interface CareerProgressMarker {
  name: string;
  hours: number;
}

const { milestones, hour_achievements, career_progress_markers } =
  milestonesData as {
    milestones: PilotMilestone[];
    hour_achievements: number[];
    career_progress_markers: CareerProgressMarker[];
  };

export function getPilotMilestones(): PilotMilestone[] {
  return milestones;
}

export function getHourAchievements(): number[] {
  return hour_achievements;
}

export function getCareerProgressMarkers(): CareerProgressMarker[] {
  return career_progress_markers;
}

export function getAge(birthDate: string, asOf = new Date()): number {
  const birth = new Date(birthDate);
  let age = asOf.getFullYear() - birth.getFullYear();
  const monthDiff = asOf.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getMilestoneHourTarget(milestone: PilotMilestone): number | null {
  if (milestone.faa_minimum_hours != null && milestone.faa_minimum_hours > 0) {
    return milestone.faa_minimum_hours;
  }
  if (milestone.typical_hours_range.length >= 2) {
    return milestone.typical_hours_range[1];
  }
  return milestone.typical_hours_range[0] ?? null;
}

export function getMilestoneTypicalRange(
  milestone: PilotMilestone
): [number, number] | null {
  if (milestone.typical_hours_range.length >= 2) {
    return [
      milestone.typical_hours_range[0],
      milestone.typical_hours_range[1],
    ];
  }
  return null;
}

export function formatTypicalHourRange(milestone: PilotMilestone): string | null {
  const range = getMilestoneTypicalRange(milestone);
  if (!range) return null;
  const [low, high] = range;
  if (low === high) return `${high} hrs`;
  if (low === 0) return `up to ${high} hrs`;
  return `${low}–${high} hrs`;
}

export function getNextMilestone(
  totalHours: number
): PilotMilestone | null {
  for (const milestone of milestones) {
    if (!milestone.track_progress) continue;
    const target = getMilestoneHourTarget(milestone);
    if (target == null) continue;
    if (totalHours < target) return milestone;
  }
  return null;
}

export function getMilestoneProgress(
  totalHours: number,
  milestone: PilotMilestone
): number {
  const target = getMilestoneHourTarget(milestone);
  if (target == null || target === 0) return 100;
  return Math.min(100, Math.round((totalHours / target) * 100));
}

export function isAgeEligible(age: number, milestone: PilotMilestone): boolean {
  return age >= milestone.minimum_age;
}

export function getEligibilityDate(
  birthDate: string,
  minimumAge: number
): Date {
  const birth = new Date(birthDate);
  return new Date(
    birth.getFullYear() + minimumAge,
    birth.getMonth(),
    birth.getDate()
  );
}

export function formatAgeEligibility(
  birthDate: string | null,
  milestone: PilotMilestone
): string {
  if (!birthDate) {
    return "Add your birthday in Settings to track age requirements";
  }

  const age = getAge(birthDate);
  if (isAgeEligible(age, milestone)) {
    return "Age eligible now";
  }

  const eligibilityDate = getEligibilityDate(birthDate, milestone.minimum_age);
  const monthsUntil = differenceInMonths(eligibilityDate, new Date());
  const dateLabel = format(eligibilityDate, "MMM d, yyyy");

  if (monthsUntil <= 0) {
    return `Eligible at age ${milestone.minimum_age} (${dateLabel})`;
  }

  return `Eligible at age ${milestone.minimum_age} (in ${monthsUntil} month${monthsUntil === 1 ? "" : "s"})`;
}

export function getNextHourAchievement(totalHours: number): {
  target: number;
  remaining: number;
} | null {
  const next = hour_achievements.find((h) => totalHours < h);
  if (!next) return null;
  return { target: next, remaining: next - totalHours };
}

export function getCareerMarker(totalHours: number): {
  current: CareerProgressMarker;
  next: CareerProgressMarker | null;
} {
  let current = career_progress_markers[0];
  let next: CareerProgressMarker | null = career_progress_markers[1] ?? null;

  for (let i = 0; i < career_progress_markers.length; i++) {
    const marker = career_progress_markers[i];
    if (totalHours >= marker.hours) {
      current = marker;
      next = career_progress_markers[i + 1] ?? null;
    }
  }

  return { current, next };
}

export function getInstrumentRequirementProgress(
  totals: FlightHourTotals,
  milestone: PilotMilestone
): {
  instrument: { current: number; target: number; percent: number };
  crossCountryPic: { current: number; target: number; percent: number };
} | null {
  if (!milestone.additional_requirements) return null;

  const instrumentTarget = milestone.additional_requirements.instrument_hours;
  const xcPicTarget = milestone.additional_requirements.cross_country_pic_hours;
  const xcPicApprox = Math.min(totals.pic, totals.crossCountry);

  return {
    instrument: {
      current: totals.instrument,
      target: instrumentTarget,
      percent: Math.min(100, Math.round((totals.instrument / instrumentTarget) * 100)),
    },
    crossCountryPic: {
      current: xcPicApprox,
      target: xcPicTarget,
      percent: Math.min(100, Math.round((xcPicApprox / xcPicTarget) * 100)),
    },
  };
}
