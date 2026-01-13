import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ incidentId: string; phaseId: string }>;
};

export const POST = async (request: NextRequest, { params }: RouteParams) => {
  const { incidentId, phaseId } = await params;
  return proxyApiRequest(
    request,
    `qg/incidents/${incidentId}/${phaseId}/request-assignment`,
    `request assignment for phase ${phaseId} of incident ${incidentId}`,
  );
};
