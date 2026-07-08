export type FlightStopType =
  | "departure"
  | "touch_and_go"
  | "full_stop"
  | "landing";

export interface FlightRouteStop {
  airport: string;
  stop_type: FlightStopType;
}

export const FLIGHT_STOP_LABELS: Record<FlightStopType, string> = {
  departure: "Departure",
  touch_and_go: "Touch & Go",
  full_stop: "Full Stop",
  landing: "Landing",
};

export const FLIGHT_STOP_SHORT: Record<FlightStopType, string> = {
  departure: "DEP",
  touch_and_go: "T&G",
  full_stop: "STOP",
  landing: "LDG",
};

export function normalizeAirportCode(code: string): string {
  return code.trim().toUpperCase();
}

export function getFlightRoute(
  route: FlightRouteStop[] | null | undefined,
  departure: string | null,
  arrival: string | null
): FlightRouteStop[] {
  if (route && route.length > 0) {
    return route.map((stop) => ({
      airport: normalizeAirportCode(stop.airport),
      stop_type: stop.stop_type,
    }));
  }

  const dep = departure ? normalizeAirportCode(departure) : null;
  const arr = arrival ? normalizeAirportCode(arrival) : null;

  if (dep && arr) {
    if (dep === arr) {
      return [
        { airport: dep, stop_type: "departure" },
        { airport: arr, stop_type: "landing" },
      ];
    }
    return [
      { airport: dep, stop_type: "departure" },
      { airport: arr, stop_type: "landing" },
    ];
  }

  if (dep) {
    return [
      { airport: dep, stop_type: "departure" },
      { airport: dep, stop_type: "landing" },
    ];
  }

  if (arr) {
    return [
      { airport: arr, stop_type: "departure" },
      { airport: arr, stop_type: "landing" },
    ];
  }

  return [];
}

export function formatFlightRoute(
  route: FlightRouteStop[] | null | undefined,
  departure: string | null,
  arrival: string | null
): string {
  const stops = getFlightRoute(route, departure, arrival);
  if (stops.length === 0) return "—";

  return stops
    .map((stop, index) => {
      const isFirst = index === 0;
      const isLast = index === stops.length - 1;
      const showType =
        stop.stop_type === "touch_and_go" ||
        stop.stop_type === "full_stop" ||
        (!isFirst && !isLast);

      if (showType && stop.stop_type !== "departure" && stop.stop_type !== "landing") {
        return `${stop.airport} (${FLIGHT_STOP_SHORT[stop.stop_type]})`;
      }
      if (isFirst && stop.stop_type === "departure" && stops.length === 1) {
        return stop.airport;
      }
      return stop.airport;
    })
    .join(" → ");
}

export function deriveEndpoints(stops: FlightRouteStop[]): {
  departure_airport: string | null;
  arrival_airport: string | null;
} {
  if (stops.length === 0) {
    return { departure_airport: null, arrival_airport: null };
  }
  return {
    departure_airport: stops[0].airport,
    arrival_airport: stops[stops.length - 1].airport,
  };
}

export function parseRouteJson(value: string | null): FlightRouteStop[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as FlightRouteStop[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map((stop) => ({
      airport: normalizeAirportCode(stop.airport),
      stop_type: stop.stop_type,
    }));
  } catch {
    return null;
  }
}

export function defaultTrainingRoute(homeAirport?: string | null): FlightRouteStop[] {
  const base = homeAirport ? normalizeAirportCode(homeAirport) : "";
  if (!base) {
    return [
      { airport: "", stop_type: "departure" },
      { airport: "", stop_type: "landing" },
    ];
  }
  return [
    { airport: base, stop_type: "departure" },
    { airport: base, stop_type: "landing" },
  ];
}
