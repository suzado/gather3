export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  displayName: string;
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const GEOCODE_CACHE = new Map<string, GeocodedLocation | null>();

export async function geocodeLocation(
  locationText: string,
  venue?: string
): Promise<GeocodedLocation | null> {
  const query = venue ? `${venue}, ${locationText}` : locationText;
  const cacheKey = query.toLowerCase().trim();

  if (GEOCODE_CACHE.has(cacheKey)) {
    return GEOCODE_CACHE.get(cacheKey) ?? null;
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
    });

    const response = await fetch(`${NOMINATIM_BASE}?${params}`, {
      headers: {
        "User-Agent": "Gather3-EventPlatform/0.1",
      },
    });

    if (!response.ok) return null;

    const results = await response.json();
    if (!results.length) {
      if (venue) {
        return geocodeLocation(locationText);
      }
      GEOCODE_CACHE.set(cacheKey, null);
      return null;
    }

    const result: GeocodedLocation = {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
      displayName: results[0].display_name,
    };

    GEOCODE_CACHE.set(cacheKey, result);
    return result;
  } catch {
    GEOCODE_CACHE.set(cacheKey, null);
    return null;
  }
}
