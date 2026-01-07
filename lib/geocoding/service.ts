"use server";

import { apiRequest } from "@/lib/api";

export type ReverseGeocodeResult = {
  address?: string;
  city?: string;
  zipcode?: string;
  formatted?: string;
};

/**
 * Reverse geocode coordinates to get an address
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseGeocodeResult | null> {
  const response = await apiRequest<ReverseGeocodeResult>(
    `/geo/address/reverse?lat=${lat}&lon=${lon}`
  );

  if (response.error || !response.data) {
    console.error("Failed to reverse geocode:", response.error);
    return null;
  }

  return response.data;
}
