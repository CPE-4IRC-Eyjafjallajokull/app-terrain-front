import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ incidentId: string }>;
};

export const GET = async (request: NextRequest, { params }: RouteParams) => {
  const { incidentId } = await params;
  return proxyApiRequest(
    request,
    `qg/incidents/${incidentId}/situation`,
    `incident ${incidentId} situation`,
  );
};
