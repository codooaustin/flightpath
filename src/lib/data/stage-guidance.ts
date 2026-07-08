import type { FlightHourTotals } from "@/lib/calculations/flight-hours";
import {
  getInstrumentRequirementProgress,
  getMilestoneHourTarget,
  getMilestoneProgress,
  getPilotMilestones,
  formatTypicalHourRange,
  type PilotMilestone,
} from "@/lib/calculations/certification";
import {
  FAA_RESOURCES,
  getFaaResource,
  type FaaResource,
} from "@/lib/data/faa-resources";
import type { MissionStatus } from "@/types/models";

const STAGE_MILESTONE_IDS: Record<string, string> = {
  Explorer: "student_pilot",
  "Student Aviator": "student_pilot",
  "Student Pilot": "first_solo",
  "Private Pilot": "private_pilot",
  "Instrument Pilot": "instrument_rating",
  "Commercial Pilot": "commercial_pilot",
  "Flight Instructor": "certified_flight_instructor",
  "Professional Pilot": "commercial_pilot",
  "Regional Airline Pilot": "atp",
  "Major Airline Captain": "atp",
};

const STAGE_RESOURCE_IDS: Record<string, string[]> = {
  Explorer: ["become_pilot", "pilot_training"],
  "Student Aviator": [
    "student_pilot",
    "medical_certificate",
    "become_pilot",
  ],
  "Student Pilot": ["first_solo", "student_pilot", "flight_logbook"],
  "Private Pilot": ["private_pilot", "pilot_training", "flight_logbook"],
  "Instrument Pilot": ["instrument_rating", "pilot_training"],
  "Commercial Pilot": ["commercial_pilot", "become_pilot"],
  "Flight Instructor": ["certified_flight_instructor", "pilot_training"],
  "Professional Pilot": ["commercial_pilot", "pilot_safety"],
  "Regional Airline Pilot": ["atp", "become_pilot"],
  "Major Airline Captain": ["atp", "pilot_safety"],
};

const DEFAULT_STAGE_RESOURCE_IDS = ["become_pilot", "pilot_training"];

export interface HourRequirementRow {
  label: string;
  current: number;
  target: number;
  percent: number;
}

export interface StageHourGuidance {
  milestone: PilotMilestone;
  faaMinimum: number | null;
  typicalRange: number[];
  requirements: HourRequirementRow[];
  faaResource: FaaResource | null;
}

export interface StageTrainingDisplay {
  milestone: PilotMilestone;
  certificate: CertificateBlock | null;
  hourAccrual: HourAccrualBlock | null;
}

export interface CertificateBlock {
  sectionTitle: string;
  name: string;
  description: string;
  faaResource: FaaResource | null;
  relatedMissionTitle: string;
}

export interface HourAccrualBlock {
  sectionTitle: string;
  primary: HourRequirementRow;
  additional: HourRequirementRow[];
  note?: string;
}

const STAGE_CERTIFICATE_MISSIONS: Record<string, string> = {
  "Student Aviator": "Obtain Student Pilot Certificate",
};

export function getStageCertificateMissionStatus(
  stageName: string,
  userMissions: { id: string; status: string; mission?: { title?: string } }[]
) {
  const missionTitle = STAGE_CERTIFICATE_MISSIONS[stageName];
  if (!missionTitle) return null;

  const userMission = userMissions.find(
    (entry) => entry.mission?.title === missionTitle
  );
  if (!userMission) return null;

  return {
    userMissionId: userMission.id,
    status: userMission.status as MissionStatus,
    missionTitle,
  };
}

function getSoloTypicalNote(): string {
  const firstSolo = getPilotMilestones().find(
    (milestone) => milestone.id === "first_solo"
  );
  if (firstSolo && firstSolo.typical_hours_range.length >= 2) {
    const [low, high] = firstSolo.typical_hours_range;
    return `Most students solo around ${low}–${high} flight hours — timing varies widely.`;
  }
  return "You can log flight hours from your first lesson; solo timing varies by student.";
}

export function getStageTrainingDisplay(
  stageName: string,
  totals: FlightHourTotals
): StageTrainingDisplay | null {
  const guidance = getStageHourGuidance(stageName, totals);
  if (!guidance) return null;

  if (guidance.milestone.id === "student_pilot") {
    const hourRequirement =
      guidance.requirements.find(
        (requirement) => requirement.label === "Typical training hours"
      ) ?? guidance.requirements[0] ?? null;

    if (!hourRequirement) return null;

    return {
      milestone: guidance.milestone,
      certificate: {
        sectionTitle: "Certification",
        name: guidance.milestone.name,
        description:
          guidance.faaResource?.summary ??
          "Required before solo flight. You can start lessons and log hours without it.",
        faaResource: guidance.faaResource,
        relatedMissionTitle: STAGE_CERTIFICATE_MISSIONS[stageName] ?? "",
      },
      hourAccrual: {
        sectionTitle: "Hour accrual",
        primary: hourRequirement,
        additional: [],
        note: getSoloTypicalNote(),
      },
    };
  }

  const typicalRangeLabel = formatTypicalHourRange(guidance.milestone);
  const primary = guidance.requirements[0];
  if (!primary) return null;

  return {
    milestone: guidance.milestone,
    certificate: null,
    hourAccrual: {
      sectionTitle: "Hour goal",
      primary,
      additional: guidance.requirements.slice(1),
      note: typicalRangeLabel
        ? `Typical training: ${typicalRangeLabel}${
            guidance.faaMinimum != null && guidance.faaMinimum > 0
              ? ` · FAA minimum: ${guidance.faaMinimum} hrs`
              : ""
          }`
        : undefined,
    },
  };
}

function resolveResources(ids: string[]): FaaResource[] {
  const seen = new Set<string>();

  return ids
    .map((id) => FAA_RESOURCES[id])
    .filter((resource): resource is FaaResource => {
      if (!resource || seen.has(resource.milestoneId)) return false;
      seen.add(resource.milestoneId);
      return true;
    });
}

export function getStageResources(stageName: string): FaaResource[] {
  const ids = STAGE_RESOURCE_IDS[stageName] ?? DEFAULT_STAGE_RESOURCE_IDS;
  return resolveResources(ids);
}

function getStageMilestone(stageName: string): PilotMilestone | null {
  const milestoneId = STAGE_MILESTONE_IDS[stageName];
  if (!milestoneId) return null;
  return getPilotMilestones().find((milestone) => milestone.id === milestoneId) ?? null;
}

export function getStageHourGuidance(
  stageName: string,
  totals: FlightHourTotals
): StageHourGuidance | null {
  const milestone = getStageMilestone(stageName);
  if (!milestone) return null;

  const requirements: HourRequirementRow[] = [];
  const faaMinimum = milestone.faa_minimum_hours;
  const typicalRange = milestone.typical_hours_range;
  const hourTarget = getMilestoneHourTarget(milestone);

  if (faaMinimum != null && faaMinimum > 0) {
    requirements.push({
      label: "FAA minimum total hours",
      current: totals.total,
      target: faaMinimum,
      percent: getMilestoneProgress(totals.total, milestone),
    });
  }

  if (typicalRange.length >= 2) {
    const typicalHigh = typicalRange[1];
    requirements.push({
      label:
        faaMinimum != null && faaMinimum > 0
          ? "Typical completion hours"
          : "Typical training hours",
      current: totals.total,
      target: typicalHigh,
      percent: Math.min(
        100,
        Math.round((totals.total / typicalHigh) * 100)
      ),
    });
  } else if (hourTarget != null && requirements.length === 0) {
    requirements.push({
      label: "Hour target",
      current: totals.total,
      target: hourTarget,
      percent: getMilestoneProgress(totals.total, milestone),
    });
  }

  const instrumentProgress = getInstrumentRequirementProgress(totals, milestone);
  if (instrumentProgress) {
    requirements.push({
      label: "Cross-country PIC",
      current: instrumentProgress.crossCountryPic.current,
      target: instrumentProgress.crossCountryPic.target,
      percent: instrumentProgress.crossCountryPic.percent,
    });
    requirements.push({
      label: "Instrument time",
      current: instrumentProgress.instrument.current,
      target: instrumentProgress.instrument.target,
      percent: instrumentProgress.instrument.percent,
    });
  }

  if (stageName === "Private Pilot" || stageName === "Student Pilot") {
    requirements.push({
      label: "Cross-country logged",
      current: totals.crossCountry,
      target: stageName === "Private Pilot" ? 10 : 5,
      percent: Math.min(
        100,
        Math.round(
          (totals.crossCountry /
            (stageName === "Private Pilot" ? 10 : 5)) *
            100
        )
      ),
    });
  }

  return {
    milestone,
    faaMinimum,
    typicalRange,
    requirements,
    faaResource: getFaaResource(milestone.id),
  };
}
