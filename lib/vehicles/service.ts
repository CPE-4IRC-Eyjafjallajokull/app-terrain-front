import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";
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
export async function fetchVehicles(signal?: AbortSignal): Promise<Vehicle[]> {
  const response = await fetchWithAuth("/api/vehicles", {
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

  if (
    parsedBody.json &&
    typeof parsedBody.json === "object" &&
    "vehicles" in parsedBody.json
  ) {
    return (parsedBody.json as VehiclesListResponse).vehicles;
  }

  return [];
}

/**
 * Fetches all vehicle types
 */
export async function fetchVehicleTypes(
  signal?: AbortSignal,
): Promise<VehicleType[]> {
  const response = await fetchWithAuth("/api/vehicles/types", {
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

  return parsedBody.json as VehicleType[];
}

/**
 * Fetches all vehicle statuses
 */
export async function fetchVehicleStatuses(
  signal?: AbortSignal,
): Promise<VehicleStatus[]> {
  const response = await fetchWithAuth("/api/vehicles/statuses", {
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

  return parsedBody.json as VehicleStatus[];
}

/**
 * Fetches all fire stations (for filter dropdown)
 */
export async function fetchFireStationsForFilter(
  signal?: AbortSignal,
): Promise<InterestPoint[]> {
  const { fetchFireStationKindId, fetchInterestPointsByKind } =
    await import("@/lib/interest-points/service");

  const kindId = await fetchFireStationKindId(signal);
  if (!kindId) {
    return [];
  }

  return fetchInterestPointsByKind(kindId, signal);
}

/**
 * Updates the status of a vehicle
 */
export async function updateVehicleStatus(
  vehicleImmatriculation: string,
  statusId: string,
): Promise<Vehicle> {
  const response = await fetchWithAuth(
    `/api/vehicles/${vehicleImmatriculation}/status`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status_id: statusId }),
    },
  );

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  return parsedBody.json as Vehicle;
}
