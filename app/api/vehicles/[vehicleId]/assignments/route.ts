import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/vehicles/[vehicleId]/assignments - Get assignment history for a vehicle
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> },
) {
  const { vehicleId } = await params;
  // Build query string for the backend API
  const backendUrl = `vehicles/assignments?vehicle_id=${vehicleId}`;
  return proxyApiRequest(request, backendUrl, "Vehicle assignments");
}
