import type { FileCategory } from "@/types/models";

export interface HangarUploadTemplate {
  category: FileCategory;
  label: string;
  description: string;
}

export const HANGAR_UPLOAD_TEMPLATES: Record<
  FileCategory | "all",
  HangarUploadTemplate[]
> = {
  all: [
    {
      category: "photos",
      label: "Discovery flight photos",
      description: "Capture your first time in the cockpit",
    },
    {
      category: "certificates",
      label: "Medical certificate",
      description: "Store your aviation medical documentation",
    },
    {
      category: "documents",
      label: "Training documents",
      description: "Syllabi, endorsements, or study materials",
    },
  ],
  certificates: [
    {
      category: "certificates",
      label: "Student pilot certificate",
      description: "Scan or photo of your student pilot certificate",
    },
    {
      category: "certificates",
      label: "Medical certificate",
      description: "Keep your medical cert backed up digitally",
    },
  ],
  photos: [
    {
      category: "photos",
      label: "Discovery flight",
      description: "Photos from your intro flight",
    },
    {
      category: "photos",
      label: "First solo",
      description: "Document your solo milestone",
    },
  ],
  aircraft: [
    {
      category: "aircraft",
      label: "Training aircraft",
      description: "Notes or photos of aircraft you fly",
    },
  ],
  equipment: [
    {
      category: "equipment",
      label: "Headset or gear",
      description: "Receipts or photos of training equipment",
    },
  ],
  documents: [
    {
      category: "documents",
      label: "Endorsements",
      description: "Logbook endorsements and training records",
    },
    {
      category: "documents",
      label: "Ground school",
      description: "Course materials or completion certificates",
    },
  ],
};

export function getMissionUploadSuggestion(
  missionTitle: string | undefined
): HangarUploadTemplate | null {
  if (!missionTitle) return null;
  if (missionTitle.includes("Medical")) {
    return HANGAR_UPLOAD_TEMPLATES.certificates[1];
  }
  if (missionTitle.includes("Student Pilot Certificate")) {
    return HANGAR_UPLOAD_TEMPLATES.certificates[0];
  }
  if (missionTitle.includes("Discovery Flight")) {
    return HANGAR_UPLOAD_TEMPLATES.photos[0];
  }
  return null;
}
