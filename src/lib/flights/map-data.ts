import type { Flight } from "@/types/models";
import type { AirportCoordinates } from "@/lib/airports/resolve";
import { resolveAirports } from "@/lib/airports/resolve";
import {
  formatFlightRoute,
  getFlightRoute,
  type FlightRouteStop,
} from "@/lib/flights/route";

export interface FlightMapPoint {
  lat: number;
  lng: number;
  code: string;
  stop_type: FlightRouteStop["stop_type"];
  name: string | null;
}

export interface FlightMapEntry {
  id: string;
  date: string;
  routeLabel: string;
  flightTime: number;
  landings: number | null;
  aircraft: string | null;
  stops: FlightRouteStop[];
  points: FlightMapPoint[];
  unresolvedCodes: string[];
}

export async function buildFlightMapEntries(
  flights: Flight[],
  limit = 5
): Promise<FlightMapEntry[]> {
  const recent = flights.slice(0, limit);
  const codes = recent.flatMap((flight) =>
    getFlightRoute(flight.route, flight.departure_airport, flight.arrival_airport)
      .map((stop) => stop.airport)
      .filter(Boolean)
  );

  const airports = await resolveAirports(codes);

  return recent.map((flight) => {
    const stops = getFlightRoute(
      flight.route,
      flight.departure_airport,
      flight.arrival_airport
    );

    const unresolvedCodes: string[] = [];
    const points: FlightMapPoint[] = stops
      .map((stop) => {
        const airport = airports.get(stop.airport);
        if (!airport) {
          if (!unresolvedCodes.includes(stop.airport)) {
            unresolvedCodes.push(stop.airport);
          }
          return null;
        }
        return {
          lat: airport.lat,
          lng: airport.lng,
          code: stop.airport,
          stop_type: stop.stop_type,
          name: airport.name,
        };
      })
      .filter((point): point is FlightMapPoint => point !== null);

    return {
      id: flight.id,
      date: flight.date,
      routeLabel: formatFlightRoute(
        flight.route,
        flight.departure_airport,
        flight.arrival_airport
      ),
      flightTime: Number(flight.flight_time),
      landings: flight.landings,
      aircraft: flight.aircraft,
      stops,
      points,
      unresolvedCodes,
    };
  });
}

export function getMapPointForStop(
  entry: FlightMapEntry,
  stopIndex: number
): FlightMapPoint | null {
  const stop = entry.stops[stopIndex];
  if (!stop?.airport) return null;
  return entry.points.find((point) => point.code === stop.airport) ?? null;
}

export function getMapBounds(points: FlightMapPoint[]) {
  if (points.length === 0) return null;

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  for (const point of points) {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ] as [[number, number], [number, number]];
}
