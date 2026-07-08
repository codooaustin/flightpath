import { FAA_RESOURCES, type FaaResource } from "@/lib/data/faa-resources";

export function getHangarGuidanceResources(): FaaResource[] {
  return [
    FAA_RESOURCES.student_pilot,
    FAA_RESOURCES.medical_certificate,
    FAA_RESOURCES.medical_exam,
    FAA_RESOURCES.flight_logbook,
    FAA_RESOURCES.pilot_training,
  ];
}
