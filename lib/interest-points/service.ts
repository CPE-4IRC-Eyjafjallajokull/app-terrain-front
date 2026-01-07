"use server";

import { apiRequest } from "@/lib/api";
import type { InterestPoint, InterestPointKind } from "./types";

const FIRE_STATION_LABEL = "centre de secours";

/**
 * Fetches all interest point kinds from the API
 */
export async function getInterestPointKinds(): Promise<InterestPointKind[]> {
  const response = await apiRequest<InterestPointKind[]>(
    "/interest-points/kinds",
  );

  if (response.error || !response.data) {
    console.error("Failed to fetch interest point kinds:", response.error);
    return [];
  }

  return response.data;
}

/**
 * Fetches the ID of the "centre de secours" kind
 */
export async function getFireStationKindId(): Promise<string | null> {
  const kinds = await getInterestPointKinds();
  const fireStationKind = kinds.find(
    (kind) => kind.label.toLowerCase() === FIRE_STATION_LABEL.toLowerCase(),
  );

  return fireStationKind?.interest_point_kind_id ?? null;
}

/**
 * Fetches interest points by kind ID
 */
export async function getInterestPointsByKind(
  kindId: string,
): Promise<InterestPoint[]> {
  const response = await apiRequest<InterestPoint[]>(
    `/terrain/interest-points/${kindId}`,
  );

  if (response.error || !response.data) {
    console.error("Failed to fetch interest points:", response.error);
    return [];
  }

  return response.data;
}

/**
 * Fetches all fire stations (centres de secours)
 */
export async function getFireStations(): Promise<InterestPoint[]> {
  const kindId = await getFireStationKindId();

  if (!kindId) {
    console.error("Fire station kind not found");
    return [];
  }

  return getInterestPointsByKind(kindId);
}
