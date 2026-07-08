import { normalizeAirportCode } from "@/lib/flights/route";

export interface AirportCoordinates {
  code: string;
  name: string | null;
  lat: number;
  lng: number;
}

const cache = new Map<string, AirportCoordinates | null>();

function airportLookupKeys(code: string): string[] {
  const normalized = normalizeAirportCode(code);
  const keys = new Set<string>([normalized]);

  if (normalized.length === 3 && !normalized.startsWith("K")) {
    keys.add(`K${normalized}`);
  }

  return [...keys];
}

async function fetchFromOpenAip(code: string): Promise<AirportCoordinates | null> {
  const keys = airportLookupKeys(code);

  for (const key of keys) {
    const url = new URL("https://api.core.openaip.net/api/airports");
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", "1");
    url.searchParams.set("icaoCode", key);

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) continue;

    const data = (await response.json()) as {
      items?: Array<{
        icaoCode?: string;
        name?: string;
        geometry?: { coordinates?: [number, number] };
      }>;
    };

    const airport = data.items?.[0];
    const coords = airport?.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;

    return {
      code: key,
      name: airport.name ?? null,
      lat: coords[1],
      lng: coords[0],
    };
  }

  return null;
}

export async function resolveAirport(
  code: string
): Promise<AirportCoordinates | null> {
  const normalized = normalizeAirportCode(code);
  if (!normalized) return null;

  if (cache.has(normalized)) {
    return cache.get(normalized) ?? null;
  }

  const result = await fetchFromOpenAip(normalized);
  cache.set(normalized, result);
  return result;
}

export async function resolveAirports(
  codes: string[]
): Promise<Map<string, AirportCoordinates>> {
  const unique = [...new Set(codes.map(normalizeAirportCode).filter(Boolean))];
  const resolved = new Map<string, AirportCoordinates>();

  await Promise.all(
    unique.map(async (code) => {
      const airport = await resolveAirport(code);
      if (airport) resolved.set(code, airport);
    })
  );

  return resolved;
}
