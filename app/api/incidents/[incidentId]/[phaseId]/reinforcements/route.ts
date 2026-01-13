import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ incidentId: string; phaseId: string }>;
};

export const GET = async (request: NextRequest, { params }: RouteParams) => {
  const { incidentId, phaseId } = await params;
  return proxyApiRequest(
    request,
    `qg/incidents/${incidentId}/${phaseId}/reinforcements`,
    `incident ${incidentId} phase ${phaseId} reinforcements`,
  );
};
