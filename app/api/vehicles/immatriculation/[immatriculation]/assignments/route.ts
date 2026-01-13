import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/vehicles/immatriculation/{immatriculation}/assignments
 * Proxy to backend: GET /qg/vehicles/{immatriculation}/assignments
 * List vehicle assignment history
 */
export const GET = (
  request: NextRequest,
  context: { params: Promise<{ immatriculation: string }> },
) =>
  context.params.then((params) =>
    proxyApiRequest(
      request,
      `qg/vehicles/${params.immatriculation}/assignments`,
    ),
  );
