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
      "Complete FAA MedXPress (Form 8500-8) before your AME appointment.",
      "Schedule with an Aviation Medical Examiner (AME) — third-class is typical for students.",
      "Bring your MedXPress confirmation number and government-issued ID to the exam.",
      "Complete the AME exam within 60 days of submitting MedXPress.",
      "Student pilot certificates issued after April 2016 do not expire.",
    ],
    url: "https://www.faa.gov/pilots/medical_certification/get",
    urlLabel: "FAA: How to Get a Medical Certificate",
  },
  medical_exam: {
    milestoneId: "medical_exam",
    title: "AME Examination Process",
    summary:
      "What to expect when you visit an Aviation Medical Examiner for your medical certificate.",
    details: [
      "Create a MedXPress account and submit your medical history before the visit.",
      "Your AME will review vitals, vision, hearing, and perform a physical exam.",
      "Bring documentation for any medical conditions or medications you report.",
      "If documentation is complete, the AME may issue your certificate at the visit.",
      "Deferred exams are reviewed by the FAA — you will receive a letter with next steps.",
    ],
    url: "https://www.faa.gov/pilots/medical_certification/get",
    urlLabel: "FAA: AME Exam & MedXPress Guide",
  },
  become_pilot: {
    milestoneId: "become_pilot",
    title: "Become a Pilot",
    summary:
      "Start here to understand certificate types, training paths, and FAA requirements.",
    details: [
      "Choose what you want to fly — airplane, helicopter, glider, balloon, and more.",
      "Certificate levels range from student pilot to airline transport pilot (ATP).",
      "Requirements differ by aircraft type and certificate sought.",
      "Covers student, recreational, and private pilot eligibility and training.",
      "Contact your nearest FSDO if you need help beyond the online guides.",
    ],
    url: "https://www.faa.gov/pilots/become",
    urlLabel: "FAA: Become a Pilot",
  },
  pilot_training: {
    milestoneId: "pilot_training",
    title: "Pilot Training",
    summary:
      "Official FAA training resources, study materials, and flight school guidance.",
    details: [
      "Review FAA handbooks, study tips, and sample knowledge test questions.",
      "Use the Pilot School Locator to find Part 141 and other training providers.",
      "WINGS program supports ongoing pilot proficiency beyond minimum requirements.",
      "Includes takeoff safety, upset recovery, and air carrier training resources.",
      "Student pilot training limits and CFI guidance are covered under certification topics.",
    ],
    url: "https://www.faa.gov/pilots/training",
    urlLabel: "FAA: Pilot Training",
  },
  pilot_safety: {
    milestoneId: "pilot_safety",
    title: "Pilot Safety",
    summary:
      "Safety alerts, proficiency programs, and reporting resources for pilots.",
    details: [
      "Check NOTAMs, TFRs, and aircraft safety alerts before every flight.",
      "FAA Safety Team (FAAST) and WINGS program support continuous proficiency.",
      "Report bird strikes and safety issues through official FAA channels.",
      "Review aeromedical safety brochures and pilot risk management materials.",
      "Register 406 MHz emergency beacons as required for your operations.",
    ],
    url: "https://www.faa.gov/pilots/safety",
    urlLabel: "FAA: Pilot Safety",
  },
  pilot_rights: {
    milestoneId: "pilot_rights",
    title: "Pilot's Bill of Rights",
    summary:
      "Your rights during FAA investigations and enforcement related to airman certificates.",
    details: [
      "Applies to investigations involving certificate approval, denial, suspension, modification, or revocation.",
      "You may be entitled to obtain relevant air traffic data during an investigation.",
      "Requests for contractor-held ATC data go through the FAA investigator on your case.",
      "Medical applicants also acknowledge the Medical Examination Bill of Rights via MedXPress.",
      "Read the official FAA guidance for current request procedures.",
    ],
    url: "https://www.faa.gov/pilots/rights",
    urlLabel: "FAA: Pilot's Bill of Rights",
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
    add("medical_exam");
    add("become_pilot");
    add("pilot_training");
  } else if (totalHours < 100) {
    add("become_pilot");
    add("pilot_training");
  }

  if (nextMilestoneId) {
    add(nextMilestoneId);
  }

  return resources;
}

export function getSupplementalFaaResources(): FaaResource[] {
  return [
    FAA_RESOURCES.become_pilot,
    FAA_RESOURCES.pilot_training,
    FAA_RESOURCES.pilot_safety,
    FAA_RESOURCES.pilot_rights,
  ];
}

const MISSION_RESOURCE_IDS: Record<string, string[]> = {
  "Take a Discovery Flight": ["become_pilot", "pilot_training"],
  "Visit Local Flight Schools": ["pilot_training", "become_pilot"],
  "Research Career Path": ["become_pilot", "pilot_training"],
  "Obtain Student Pilot Certificate": ["student_pilot"],
  "Pass FAA Medical Exam": ["medical_certificate", "medical_exam"],
  "Begin Ground School": ["pilot_training", "become_pilot"],
  "Complete Pre-Solo Requirements": [
    "student_pilot",
    "flight_logbook",
    "pilot_training",
  ],
  "First Solo Flight": ["first_solo", "student_pilot", "flight_logbook"],
  "Solo Cross-Country": ["student_pilot", "flight_logbook", "pilot_training"],
  "Pass FAA Written Exam": ["private_pilot", "pilot_training", "become_pilot"],
  "Complete Required Flight Hours": [
    "private_pilot",
    "flight_logbook",
    "pilot_training",
  ],
  "Pass Private Pilot Checkride": ["private_pilot", "become_pilot"],
};

const DEFAULT_MISSION_RESOURCE_IDS = ["become_pilot", "pilot_training"];

export function getMissionResources(missionTitle: string): FaaResource[] {
  const ids =
    MISSION_RESOURCE_IDS[missionTitle] ?? DEFAULT_MISSION_RESOURCE_IDS;
  const seen = new Set<string>();

  return ids
    .map((id) => FAA_RESOURCES[id])
    .filter((resource): resource is FaaResource => {
      if (!resource || seen.has(resource.milestoneId)) return false;
      seen.add(resource.milestoneId);
      return true;
    });
}

export const LOGBOOK_FIELD_HELP: Record<
  string,
  { label: string; tip: string }
> = {
  flight_time: {
    label: "Flight Time",
    tip: "Total duration of the flight from start to shutdown.",
  },
  total_hours: {
    label: "Total Hours",
    tip: "Sum of all flight time logged across every entry in your logbook.",
  },
  pic_time: {
    label: "Pilot in Command",
    tip: "Pilot-in-command time — when you acted as sole manipulator of the controls and were responsible for the flight.",
  },
  dual_time: {
    label: "Dual Instruction",
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
  landings: {
    label: "Landings",
    tip: "Total number of landings recorded across all logged flights.",
  },
  flights: {
    label: "Flights",
    tip: "Number of individual flight entries in your logbook.",
  },
};
