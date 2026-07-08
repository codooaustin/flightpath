import type { EventType } from "@/types/models";

export interface EventTemplate {
  title: string;
  type: EventType;
  description: string;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    title: "Flight lesson",
    type: "flight",
    description: "Dual instruction or solo practice",
  },
  {
    title: "Ground study session",
    type: "study",
    description: "Syllabus review or written test prep",
  },
  {
    title: "Medical exam appointment",
    type: "medical",
    description: "Visit with an Aviation Medical Examiner",
  },
  {
    title: "Written knowledge test",
    type: "test",
    description: "FAA knowledge exam at a testing center",
  },
];

const MISSION_EVENT_SUGGESTIONS: Record<string, EventTemplate> = {
  "Pass FAA Medical Exam": {
    title: "Schedule medical exam",
    type: "medical",
    description: "Book your AME appointment — complete MedXPress first",
  },
  "Pass FAA Written Exam": {
    title: "Written knowledge test",
    type: "test",
    description: "Schedule your FAA knowledge exam",
  },
  "Pass Private Pilot Checkride": {
    title: "Checkride",
    type: "checkride",
    description: "Practical test with a DPE",
  },
  "Begin Ground School": {
    title: "Ground study session",
    type: "study",
    description: "Structured ground school or self-study block",
  },
  "First Solo Flight": {
    title: "First solo flight",
    type: "flight",
    description: "Your first time flying without an instructor",
  },
};

export function getMissionEventSuggestion(
  missionTitle: string | undefined
): EventTemplate | null {
  if (!missionTitle) return null;
  return MISSION_EVENT_SUGGESTIONS[missionTitle] ?? null;
}
