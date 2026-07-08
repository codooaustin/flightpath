import { FLIGHT_STOP_LABELS, type FlightStopType } from "@/lib/flights/route";
import type { LucideIcon } from "lucide-react";
import {
  CircleDot,
  MapPin,
  PlaneLanding,
  PlaneTakeoff,
} from "lucide-react";

export interface StopDisplay {
  icon: LucideIcon;
  label: string;
  iconClassName: string;
  badgeClassName: string;
}

export function getStopDisplay(
  stopType: FlightStopType,
  index: number,
  total: number
): StopDisplay {
  if (index === 0 && stopType === "departure") {
    return {
      icon: PlaneTakeoff,
      label: FLIGHT_STOP_LABELS.departure,
      iconClassName: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
      badgeClassName:
        "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    };
  }
  if (index === total - 1 && stopType === "landing") {
    return {
      icon: PlaneLanding,
      label: FLIGHT_STOP_LABELS.landing,
      iconClassName:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      badgeClassName:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    };
  }
  if (stopType === "touch_and_go") {
    return {
      icon: CircleDot,
      label: FLIGHT_STOP_LABELS.touch_and_go,
      iconClassName:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      badgeClassName:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    };
  }
  if (stopType === "full_stop") {
    return {
      icon: MapPin,
      label: FLIGHT_STOP_LABELS.full_stop,
      iconClassName:
        "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
      badgeClassName:
        "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    };
  }
  return {
    icon: MapPin,
    label: "Stop",
    iconClassName: "bg-muted text-muted-foreground",
    badgeClassName: "bg-muted text-muted-foreground border-border",
  };
}

function titleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatAirportName(name: string): string {
  return name
    .split("/")
    .map((part) => titleCase(part))
    .filter(Boolean)
    .join(" · ");
}

export function parseAirportName(name: string): {
  city: string | null;
  airport: string | null;
} {
  const parts = name
    .split("/")
    .map((part) => titleCase(part))
    .filter(Boolean);

  if (parts.length === 0) {
    return { city: null, airport: null };
  }

  if (parts.length === 1) {
    return { city: null, airport: parts[0] };
  }

  const city = parts[0];
  const airportParts = parts.slice(1).filter((part) => part !== city);
  const airport = airportParts.join(" · ") || parts[1];

  return { city, airport };
}
