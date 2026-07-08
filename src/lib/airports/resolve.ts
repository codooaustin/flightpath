import { normalizeAirportCode } from "@/lib/flights/route";

export interface AirportCoordinates {
  code: string;
  name: string | null;
  lat: number;
  lng: number;
}

const cache = new Map<string, AirportCoordinates | null>();

const AVIATION_WEATHER_API =
  "https://aviationweather.gov/api/data/airport";

interface AviationWeatherAirport {
  icaoId?: string;
  iataId?: string;
  faaId?: string;
  name?: string;
  lat?: number;
  lon?: number;
}

function airportLookupKeys(code: string): string[] {
  const normalized = normalizeAirportCode(code);
  const keys = new Set<string>([normalized]);

  if (normalized.length === 3 && !normalized.startsWith("K")) {
    keys.add(`K${normalized}`);
  }

  return [...keys];
}

function airportIdentifiers(airport: AviationWeatherAirport): string[] {
  return [airport.icaoId, airport.faaId, airport.iataId]
    .filter((id): id is string => Boolean(id) && id !== "-")
    .map((id) => id.toUpperCase());
}

function matchAirport(
  airports: AviationWeatherAirport[],
  code: string
): AirportCoordinates | null {
  const keys = airportLookupKeys(code);

  for (const airport of airports) {
    const identifiers = airportIdentifiers(airport);
    if (!keys.some((key) => identifiers.includes(key))) continue;

    const { lat, lon } = airport;
    if (lat == null || lon == null) continue;

    return {
      code: normalizeAirportCode(code),
      name: airport.name?.trim() ?? null,
      lat,
      lng: lon,
    };
  }

  return null;
}

async function fetchFromAviationWeather(
  lookupIds: string[]
): Promise<AviationWeatherAirport[]> {
  if (lookupIds.length === 0) return [];

  const url = new URL(AVIATION_WEATHER_API);
  url.searchParams.set("ids", lookupIds.join(","));
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!response.ok || response.status === 204) return [];

  const text = await response.text();
  if (!text.trim()) return [];

  try {
    const data = JSON.parse(text) as AviationWeatherAirport[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function resolveAirport(
  code: string
): Promise<AirportCoordinates | null> {
  const normalized = normalizeAirportCode(code);
  if (!normalized) return null;

  if (cache.has(normalized)) {
    return cache.get(normalized) ?? null;
  }

  const lookupIds = airportLookupKeys(normalized);
  const airports = await fetchFromAviationWeather(lookupIds);
  const result = matchAirport(airports, normalized);
  cache.set(normalized, result);
  return result;
}

export async function resolveAirports(
  codes: string[]
): Promise<Map<string, AirportCoordinates>> {
  const unique = [...new Set(codes.map(normalizeAirportCode).filter(Boolean))];
  const resolved = new Map<string, AirportCoordinates>();
  const pending: string[] = [];

  for (const code of unique) {
    if (cache.has(code)) {
      const cached = cache.get(code);
      if (cached) resolved.set(code, cached);
      continue;
    }
    pending.push(code);
  }

  if (pending.length > 0) {
    const lookupIds = [
      ...new Set(pending.flatMap((code) => airportLookupKeys(code))),
    ];
    const airports = await fetchFromAviationWeather(lookupIds);

    for (const code of pending) {
      const airport = matchAirport(airports, code);
      cache.set(code, airport);
      if (airport) resolved.set(code, airport);
    }
  }

  return resolved;
}
