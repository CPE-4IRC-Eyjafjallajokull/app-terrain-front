import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";
import type { InterestPoint, InterestPointKind } from "./types";

const FIRE_STATION_LABEL = "centre de secours";

/**
 * Fetches all interest point kinds from the API
 */
export async function fetchInterestPointKinds(
  signal?: AbortSignal,
): Promise<InterestPointKind[]> {
  const response = await fetchWithAuth("/api/interest-points/kinds", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  if (!Array.isArray(parsedBody.json)) {
    return [];
  }

  return parsedBody.json as InterestPointKind[];
}

/**
 * Fetches the ID of the "centre de secours" kind
 */
export async function fetchFireStationKindId(
  signal?: AbortSignal,
): Promise<string | null> {
  const kinds = await fetchInterestPointKinds(signal);
  const fireStationKind = kinds.find(
    (kind) => kind.label.toLowerCase() === FIRE_STATION_LABEL.toLowerCase(),
  );

  return fireStationKind?.interest_point_kind_id ?? null;
}

/**
 * Fetches interest points by kind ID
 */
export async function fetchInterestPointsByKind(
  kindId: string,
  signal?: AbortSignal,
): Promise<InterestPoint[]> {
  const response = await fetchWithAuth(`/api/interest-points/by-kind/${kindId}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  if (!Array.isArray(parsedBody.json)) {
    return [];
  }

  return parsedBody.json as InterestPoint[];
}

/**
 * Fetches all fire stations (centres de secours)
 */
export async function fetchFireStations(
  signal?: AbortSignal,
): Promise<InterestPoint[]> {
  const kindId = await fetchFireStationKindId(signal);

  if (!kindId) {
    console.error("Fire station kind not found");
    return [];
  }

  return fetchInterestPointsByKind(kindId, signal);
}
