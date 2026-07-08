export interface FaaResource {
  milestoneId: string;
  title: string;
  summary: string;
  details: string[];
  url: string;
  urlLabel: string;
}

export const FAA_RESOURCES: Record<string, FaaResource> = {
  student_pilot: {
    milestoneId: "student_pilot",
    title: "Student Pilot Certificate",
    summary:
      "You need this before your first solo flight. You do not need it to start taking flying lessons.",
    details: [
      "Must be at least 16 years old (14 for glider or balloon).",
      "Must read, speak, and understand English.",
      "Apply through IACRA or FAA Form 8710-1 via an FSDO, DPE, Part 141 representative, or CFI.",
      "You also need a valid aviation medical certificate before soloing.",
      "Carry your student pilot certificate and medical certificate during solo flight.",
      "Solo endorsements are recorded in your logbook, not on the certificate.",
      "A separate endorsement is required for solo cross-country flights.",
    ],
    url: "https://www.faa.gov/pilots/become/student_cert",
    urlLabel: "FAA: Student Pilot Certificate Requirements",
  },
  first_solo: {
    milestoneId: "first_solo",
    title: "First Solo Flight",
    summary:
      "Your first flight without an instructor on board, after training and endorsements.",
    details: [
      "Requires a student pilot certificate and valid medical certificate.",
      "Your CFI must endorse your logbook for each aircraft make and model before you solo.",
      "Typical training ranges from 15–30 hours before first solo, but timing varies.",
      "You must carry your certificates and logbook endorsements when flying solo.",
    ],
    url: "https://www.faa.gov/pilots/become/student_cert",
    urlLabel: "FAA: Student Pilot Requirements & Solo Endorsements",
  },
  private_pilot: {
    milestoneId: "private_pilot",
    title: "Private Pilot Certificate",
    summary:
      "Your first pilot license — allows you to fly for personal travel and recreation.",
    details: [
      "Minimum age 17.",
      "FAA minimum 40 hours total flight time (often 60–75 hours in practice).",
      "Includes dual, solo, cross-country, and night training requirements.",
      "Pass a knowledge test and practical checkride with a designated examiner.",
    ],
    url: "https://www.faa.gov/pilots/become",
    urlLabel: "FAA: Become a Pilot",
  },
  instrument_rating: {
    milestoneId: "instrument_rating",
    title: "Instrument Rating",
    summary:
      "Adds the privilege to fly in instrument meteorological conditions (IMC).",
    details: [
      "Minimum age 17.",
      "Requires 50 hours of cross-country PIC time and 40 hours of instrument training.",
      "Must hold at least a private pilot certificate.",
      "Pass an instrument knowledge test and checkride.",
    ],
    url: "https://www.faa.gov/pilots/become",
    urlLabel: "FAA: Become a Pilot",
  },
  commercial_pilot: {
    milestoneId: "commercial_pilot",
    title: "Commercial Pilot Certificate",
    summary: "Allows you to be compensated for flying in qualifying operations.",
    details: [
      "Minimum age 18.",
      "FAA minimum 250 hours total flight time.",
      "Includes specific training in complex aircraft and maneuvers.",
      "Pass a commercial knowledge test and checkride.",
    ],
    url: "https://www.faa.gov/pilots/become",
    urlLabel: "FAA: Become a Pilot",
  },
  certified_flight_instructor: {
    milestoneId: "certified_flight_instructor",
    title: "Certified Flight Instructor (CFI)",
    summary:
      "A common pathway to build flight hours while teaching other pilots.",
    details: [
      "Minimum age 18.",
      "Requires a commercial pilot certificate (or ATP in some cases).",
      "Pass FOI and CFI knowledge tests plus a practical exam.",
      "Allows you to endorse student pilots and log dual given.",
    ],
    url: "https://www.faa.gov/pilots/become",
    urlLabel: "FAA: Become a Pilot",
  },
  atp: {
    milestoneId: "atp",
    title: "Airline Transport Pilot (ATP)",
    summary: "Required certificate for airline and certain commercial operations.",
    details: [
      "Minimum age 23.",
      "FAA minimum 1,500 hours total flight time.",
      "Includes specific cross-country, night, and instrument experience.",
      "Pass the ATP knowledge test and practical exam.",
    ],
    url: "https://www.faa.gov/pilots/become",
    urlLabel: "FAA: Become a Pilot",
  },
  medical_certificate: {
    milestoneId: "medical_certificate",
    title: "Aviation Medical Certificate",
    summary:
      "Required before solo flight. Separate from your student pilot certificate.",
    details: [
      "Schedule an exam with an Aviation Medical Examiner (AME).",
      "Third-class medical is typical for student and private pilots.",
      "Medical validity periods depend on your age and certificate class.",
      "Student pilot certificates issued after April 2016 do not expire.",
    ],
    url: "https://www.faa.gov/pilots/medical_certification/",
    urlLabel: "FAA: Medical Certification",
  },
  flight_logbook: {
    milestoneId: "flight_logbook",
    title: "Logging Flight Time",
    summary:
      "Accurate logbook entries support certifications, insurance, and career progress.",
    details: [
      "Log total flight time for each entry; break out PIC, dual, cross-country, night, and instrument as applicable.",
      "Solo endorsements and cross-country solo approvals belong in your logbook.",
      "Your CFI may log dual instruction time they provide to you.",
      "Keep records aligned with FAA requirements for your target certificate.",
    ],
    url: "https://www.faa.gov/pilots/become/student_cert",
    urlLabel: "FAA: Student Pilot & Logbook Endorsements",
  },
  age_requirements: {
    milestoneId: "age_requirements",
    title: "FAA Age Requirements",
    summary:
      "Minimum ages vary by certificate. Your birth date helps track when you become eligible.",
    details: [
      "Student pilot (airplane): 16 years old.",
      "Private pilot: 17 years old.",
      "Commercial pilot and CFI: 18 years old.",
      "Airline Transport Pilot (ATP): 23 years old.",
      "Glider and balloon student pilots may solo at 14.",
    ],
    url: "https://www.faa.gov/pilots/become/student_cert",
    urlLabel: "FAA: Student Pilot Certificate Requirements",
  },
};

export function getFaaResource(milestoneId: string): FaaResource | null {
  return FAA_RESOURCES[milestoneId] ?? null;
}

export function getRelevantFaaResources(
  totalHours: number,
  nextMilestoneId: string | null
): FaaResource[] {
  const seen = new Set<string>();
  const resources: FaaResource[] = [];

  function add(id: string) {
    if (seen.has(id)) return;
    const resource = FAA_RESOURCES[id];
    if (!resource) return;
    seen.add(id);
    resources.push(resource);
  }

  if (totalHours < 30) {
    add("student_pilot");
    add("medical_certificate");
  }

  if (nextMilestoneId) {
    add(nextMilestoneId);
  }

  return resources;
}

export const LOGBOOK_FIELD_HELP: Record<
  string,
  { label: string; tip: string }
> = {
  flight_time: {
    label: "Flight Time",
    tip: "Total duration of the flight from start to shutdown.",
  },
  pic_time: {
    label: "PIC Time",
    tip: "Pilot-in-command time — when you acted as sole manipulator of the controls and were responsible for the flight.",
  },
  dual_time: {
    label: "Dual Time",
    tip: "Flight time with a certificated flight instructor providing training.",
  },
  cross_country_time: {
    label: "Cross-Country",
    tip: "Flight between airports at least 50 nautical miles apart (FAA definition for most certificates).",
  },
  night_time: {
    label: "Night Time",
    tip: "Flight between the end of evening civil twilight and the beginning of morning civil twilight.",
  },
  instrument_time: {
    label: "Instrument Time",
    tip: "Time operating solely by reference to instruments, typically with a view-limiting device or in IMC.",
  },
};
