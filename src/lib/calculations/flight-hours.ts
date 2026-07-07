import type { Flight } from "@/types/models";

export interface FlightHourTotals {
  total: number;
  pic: number;
  dual: number;
  crossCountry: number;
  night: number;
  instrument: number;
  landings: number;
}

export function sumFlightHours(flights: Flight[]): FlightHourTotals {
  return flights.reduce(
    (acc, flight) => ({
      total: acc.total + Number(flight.flight_time),
      pic: acc.pic + Number(flight.pic_time ?? 0),
      dual: acc.dual + Number(flight.dual_time ?? 0),
      crossCountry: acc.crossCountry + Number(flight.cross_country_time ?? 0),
      night: acc.night + Number(flight.night_time ?? 0),
      instrument: acc.instrument + Number(flight.instrument_time ?? 0),
      landings: acc.landings + Number(flight.landings ?? 0),
    }),
    {
      total: 0,
      pic: 0,
      dual: 0,
      crossCountry: 0,
      night: 0,
      instrument: 0,
      landings: 0,
    }
  );
}

export function formatHours(hours: number): string {
  return hours.toFixed(1);
}
