import { proxyApiRequest } from "@/lib/api-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const GET = (request: NextRequest) =>
  proxyApiRequest(
    request,
    "incidents/reinforcement-vehicle-requests",
    "reinforcement vehicle requests list",
  );

export const POST = (request: NextRequest) =>
  proxyApiRequest(
    request,
    "incidents/reinforcement-vehicle-requests",
    "create reinforcement vehicle request",
  );
