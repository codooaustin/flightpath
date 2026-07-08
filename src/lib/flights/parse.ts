import type { Flight, FlightRouteStop } from "@/types/models";
import type { Database } from "@/types/database";

type FlightRow = Database["public"]["Tables"]["flights"]["Row"];

function parseRoute(value: unknown): FlightRouteStop[] | null {
  if (!Array.isArray(value)) return null;
  return value as FlightRouteStop[];
}

export function parseFlight(row: FlightRow): Flight {
  return {
    ...row,
    route: parseRoute(row.route),
  };
}

export function parseFlights(rows: FlightRow[]): Flight[] {
  return rows.map(parseFlight);
}
