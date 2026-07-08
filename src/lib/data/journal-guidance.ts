import { FAA_RESOURCES, type FaaResource } from "@/lib/data/faa-resources";

export function getJournalReflectionResources(): FaaResource[] {
  return [
    FAA_RESOURCES.become_pilot,
    FAA_RESOURCES.first_solo,
    FAA_RESOURCES.pilot_training,
    FAA_RESOURCES.pilot_safety,
    FAA_RESOURCES.private_pilot,
  ];
}
