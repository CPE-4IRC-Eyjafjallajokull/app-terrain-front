import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const PATCH = (
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) => {
  return params.then((resolvedParams) =>
    proxyApiRequest(
      request,
      `qg/vehicles/${resolvedParams.vehicleId}/status`,
      "vehicles"
    )
  );
};
