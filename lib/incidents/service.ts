import { fetchWithAuth } from "@/lib/auth-redirect";
import { getErrorMessage, parseResponseBody } from "@/lib/api-response";
import type {
  IncidentRead,
  IncidentSituation,
  IncidentEngagements,
  IncidentCasualties,
  CasualtyType,
  CasualtyStatus,
  CasualtyCreate,
  CasualtyUpdate,
  CasualtyRead,
} from "./types";

/**
 * Fetches all incidents
 */
export async function fetchIncidents(
  signal?: AbortSignal,
): Promise<IncidentRead[]> {
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

  return parsedBody.json as IncidentRead[];
}

/**
 * Fetches incident situation (detail with phases, resources, casualties summary)
 */
export async function fetchIncidentSituation(
  incidentId: string,
  signal?: AbortSignal,
): Promise<IncidentSituation> {
  const response = await fetchWithAuth(
    `/api/incidents/${incidentId}/situation`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    },
  );

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  return parsedBody.json as IncidentSituation;
}

/**
 * Fetches incident vehicle engagements
 */
export async function fetchIncidentEngagements(
  incidentId: string,
  signal?: AbortSignal,
): Promise<IncidentEngagements> {
  const response = await fetchWithAuth(
    `/api/incidents/${incidentId}/engagements`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    },
  );

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  return parsedBody.json as IncidentEngagements;
}

/**
 * Fetches incident casualties
 */
export async function fetchIncidentCasualties(
  incidentId: string,
  signal?: AbortSignal,
): Promise<IncidentCasualties> {
  const response = await fetchWithAuth(
    `/api/incidents/${incidentId}/casualties`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    },
  );

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }

  return parsedBody.json as IncidentCasualties;
}

/**
 * Fetches all casualty types
 */
export async function fetchCasualtyTypes(
  signal?: AbortSignal,
): Promise<CasualtyType[]> {
  const response = await fetchWithAuth("/api/casualties/types", {
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

  return parsedBody.json as CasualtyType[];
}

/**
 * Fetches all casualty statuses
 */
export async function fetchCasualtyStatuses(
  signal?: AbortSignal,
): Promise<CasualtyStatus[]> {
  const response = await fetchWithAuth("/api/casualties/statuses", {
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

  return parsedBody.json as CasualtyStatus[];
}

/**
 * Creates a new casualty
 */
export async function createCasualty(
  data: CasualtyCreate,
): Promise<CasualtyRead> {
  const response = await fetchWithAuth("/api/casualties", {
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

  return parsedBody.json as CasualtyRead;
}

/**
 * Updates an existing casualty
 */
export async function updateCasualty(
  casualtyId: string,
  data: CasualtyUpdate,
): Promise<CasualtyRead> {
  const response = await fetchWithAuth(`/api/casualties/${casualtyId}`, {
    method: "PATCH",
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

  return parsedBody.json as CasualtyRead;
}

/**
 * Deletes a casualty
 */
export async function deleteCasualty(casualtyId: string): Promise<void> {
  const response = await fetchWithAuth(`/api/casualties/${casualtyId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok && response.status !== 204) {
    const parsedBody = await parseResponseBody(response);
    const message = getErrorMessage(response, parsedBody);
    throw new Error(message);
  }
}
