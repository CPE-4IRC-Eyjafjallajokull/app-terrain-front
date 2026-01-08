import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ casualtyId: string }>;
};

export const PATCH = async (request: NextRequest, { params }: RouteParams) => {
  const { casualtyId } = await params;
  return proxyApiRequest(
    request,
    `casualties/${casualtyId}`,
    `update casualty ${casualtyId}`,
  );
};

export const DELETE = async (request: NextRequest, { params }: RouteParams) => {
  const { casualtyId } = await params;
  return proxyApiRequest(
    request,
    `casualties/${casualtyId}`,
    `delete casualty ${casualtyId}`,
  );
};
