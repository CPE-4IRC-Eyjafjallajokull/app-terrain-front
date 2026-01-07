"use server";

import { apiRequest } from "@/lib/api";
import type {
  Vehicle,
  VehiclesListResponse,
  VehicleType,
  VehicleStatus,
} from "./types";
import type { InterestPoint } from "@/lib/interest-points/types";

/**
 * Fetches all vehicles with their complete information
 */
export async function getVehicles(): Promise<Vehicle[]> {
  const response = await apiRequest<VehiclesListResponse>("/qg/vehicles");

  if (response.error || !response.data) {
    console.error("Failed to fetch vehicles:", response.error);
    return [];
  }

  return response.data.vehicles;
}

/**
 * Fetches all vehicle types
 */
export async function getVehicleTypes(): Promise<VehicleType[]> {
  const response = await apiRequest<VehicleType[]>("/vehicles/types");

  if (response.error || !response.data) {
    console.error("Failed to fetch vehicle types:", response.error);
    return [];
  }

  return response.data;
}

/**
 * Fetches all vehicle statuses
 */
export async function getVehicleStatuses(): Promise<VehicleStatus[]> {
  const response = await apiRequest<VehicleStatus[]>("/vehicles/statuses");

  if (response.error || !response.data) {
    console.error("Failed to fetch vehicle statuses:", response.error);
    return [];
  }

  return response.data;
}

/**
 * Fetches all fire stations (for filter dropdown)
 */
export async function getFireStationsForFilter(): Promise<InterestPoint[]> {
  // First get the fire station kind ID
  const { getFireStationKindId, getInterestPointsByKind } = await import(
    "@/lib/interest-points/service"
  );

  const kindId = await getFireStationKindId();
  if (!kindId) {
    return [];
  }

  return getInterestPointsByKind(kindId);
}
