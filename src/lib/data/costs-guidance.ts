import { FAA_RESOURCES, type FaaResource } from "@/lib/data/faa-resources";

export function getCostsGuidanceResources(): FaaResource[] {
  return [
    FAA_RESOURCES.become_pilot,
    FAA_RESOURCES.medical_certificate,
    FAA_RESOURCES.medical_exam,
    FAA_RESOURCES.pilot_training,
  ];
}
