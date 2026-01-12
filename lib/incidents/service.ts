import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";
import type {
  Incident,
  IncidentEngagements,
  Reinforcement,
  ReinforcementCreate,
  ReinforcementVehicleRequest,
  ReinforcementVehicleRequestCreate,
  VehicleType,
} from "./types";

/**
 * Fetches all incidents
 */
export async function fetchIncidents(signal?: AbortSignal): Promise<Incident[]> {
  const response = await fetchWithAuth("/api/incidents", {
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

  return parsedBody.json as Incident[];
}

/**
 * Fetches a single incident by ID
 */
export async function fetchIncident(
  incidentId: string,
  signal?: AbortSignal,
): Promise<Incident> {
  const response = await fetchWithAuth(`/api/incidents/${incidentId}`, {
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

  return parsedBody.json as Incident;
}

/**
 * Fetches engagements (vehicle assignments) for an incident
 */
export async function fetchIncidentEngagements(
  incidentId: string,
  signal?: AbortSignal,
): Promise<IncidentEngagements> {
  const response = await fetchWithAuth(`/api/incidents/${incidentId}/engagements`, {
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

  return parsedBody.json as IncidentEngagements;
}

/**
 * Fetches all vehicle types (for reinforcement selection)
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
 * Creates a reinforcement request for an incident phase
 */
export async function createReinforcement(
  data: ReinforcementCreate,
): Promise<Reinforcement> {
  const response = await fetchWithAuth("/api/incidents/reinforcements", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  return parsedBody.json as Reinforcement;
}

/**
 * Creates a reinforcement vehicle request (specifying type and quantity)
 */
export async function createReinforcementVehicleRequest(
  data: ReinforcementVehicleRequestCreate,
): Promise<ReinforcementVehicleRequest> {
  const response = await fetchWithAuth("/api/incidents/reinforcement-vehicle-requests", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  return parsedBody.json as ReinforcementVehicleRequest;
}

/**
 * Fetches reinforcements for a specific incident phase
 */
export async function fetchReinforcements(
  incidentPhaseId?: string,
  signal?: AbortSignal,
): Promise<Reinforcement[]> {
  const url = incidentPhaseId 
    ? `/api/incidents/reinforcements?incident_phase_id=${incidentPhaseId}`
    : "/api/incidents/reinforcements";
    
  const response = await fetchWithAuth(url, {
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

  return parsedBody.json as Reinforcement[];
}

/**
 * Fetches reinforcement vehicle requests for a specific reinforcement
 */
export async function fetchReinforcementVehicleRequests(
  reinforcementId?: string,
  signal?: AbortSignal,
): Promise<ReinforcementVehicleRequest[]> {
  const url = reinforcementId
    ? `/api/incidents/reinforcement-vehicle-requests?reinforcement_id=${reinforcementId}`
    : "/api/incidents/reinforcement-vehicle-requests";

  const response = await fetchWithAuth(url, {
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

  return parsedBody.json as ReinforcementVehicleRequest[];
}
