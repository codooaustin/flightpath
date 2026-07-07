export type UserRole = "student" | "parent";

export type MissionStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

export type EventType =
  | "flight"
  | "study"
  | "test"
  | "medical"
  | "checkride"
  | "scholarship";

export type ExpenseCategory =
  | "flight_training"
  | "books"
  | "equipment"
  | "medical"
  | "tests"
  | "travel";

export type FileCategory =
  | "certificates"
  | "photos"
  | "aircraft"
  | "equipment"
  | "documents";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  birth_date: string | null;
  target_airline: string | null;
  career_goal: string | null;
  home_airport: string | null;
  created_at: string;
}

export interface Stage {
  id: string;
  name: string;
  description: string | null;
  order_number: number;
}

export interface Mission {
  id: string;
  stage_id: string;
  title: string;
  description: string | null;
  why_it_matters: string | null;
  requirements: string[] | null;
  estimated_cost: number | null;
  estimated_duration: string | null;
  order_number: number;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  status: MissionStatus;
  completion_date: string | null;
  notes: string | null;
  created_at: string;
  mission?: Mission;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  type: EventType;
  start_date: string;
  end_date: string | null;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  description: string | null;
  amount: number;
  date: string;
  receipt_url: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  entry_date: string;
  mission_id: string | null;
  created_at: string;
}

export interface HangarFile {
  id: string;
  user_id: string;
  category: FileCategory;
  file_url: string;
  file_name: string;
  description: string | null;
  bucket: string;
  created_at: string;
}

export interface StudentParentLink {
  id: string;
  parent_id: string;
  student_id: string;
  created_at: string;
  student?: Profile;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  flight: "Flight",
  study: "Study",
  test: "Test",
  medical: "Medical",
  checkride: "Checkride",
  scholarship: "Scholarship",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  flight_training: "Flight Training",
  books: "Books",
  equipment: "Equipment",
  medical: "Medical",
  tests: "Tests",
  travel: "Travel",
};

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  certificates: "Certificates",
  photos: "Photos",
  aircraft: "Aircraft",
  equipment: "Equipment",
  documents: "Documents",
};

export const MISSION_STATUS_LABELS: Record<MissionStatus, string> = {
  locked: "Locked",
  available: "Available",
  in_progress: "In Progress",
  completed: "Completed",
};
