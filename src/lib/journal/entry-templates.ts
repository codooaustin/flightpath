export interface JournalTemplate {
  title: string;
  content: string;
  description: string;
}

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    title: "What I learned today",
    content:
      "Today I practiced...\n\nWhat clicked:\n\nWhat to work on next:",
    description: "Capture lessons from a training day",
  },
  {
    title: "First solo reflection",
    content:
      "My first solo was...\n\nHow I felt:\n\nWhat I'd tell another student:",
    description: "Document a milestone moment",
  },
  {
    title: "Checkride prep notes",
    content:
      "Areas I'm confident in:\n\nAreas to review:\n\nQuestions for my CFI:",
    description: "Organize checkride preparation",
  },
];

const MISSION_JOURNAL_SUGGESTIONS: Record<string, JournalTemplate> = {
  "Pass FAA Medical Exam": {
    title: "Medical exam reflection",
    content:
      "My AME appointment was...\n\nAnything surprising:\n\nNext steps for training:",
    description: "Reflect on your medical certification visit",
  },
  "First Solo Flight": {
    title: "First solo reflection",
    content:
      "My first solo was...\n\nHow I felt before and after:\n\nWhat I want to remember:",
    description: "Capture your first solo flight",
  },
  "Pass FAA Written Exam": {
    title: "Written test debrief",
    content:
      "Topics that showed up:\n\nWhat I studied that helped:\n\nWhat I'd study differently:",
    description: "Note what worked for your knowledge test",
  },
  "Pass Private Pilot Checkride": {
    title: "Checkride reflection",
    content:
      "The checkride covered...\n\nWhat went well:\n\nAdvice for future applicants:",
    description: "Document your practical test experience",
  },
  "Begin Ground School": {
    title: "Ground school notes",
    content:
      "Today's topics:\n\nKey takeaways:\n\nQuestions to follow up on:",
    description: "Summarize a ground lesson",
  },
};

export function getMissionJournalSuggestion(
  missionTitle: string | undefined
): JournalTemplate | null {
  if (!missionTitle) return null;
  return MISSION_JOURNAL_SUGGESTIONS[missionTitle] ?? null;
}
