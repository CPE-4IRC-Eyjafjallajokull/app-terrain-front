import { serverEnv } from "./env.server";

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Makes a request to the backend API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${serverEnv.API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const text = await response.text();
    let json: T | null = null;

    if (text) {
      try {
        json = JSON.parse(text) as T;
      } catch {
        // Response is not JSON
      }
    }

    if (!response.ok) {
      const errorMessage =
        json && typeof json === "object" && "error" in json
          ? String((json as { error?: unknown }).error)
          : text || response.statusText || `Request failed (${response.status})`;
      return { data: null, error: errorMessage };
    }

    return { data: json, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
