import { proxyApiRequest } from "@/lib/api-proxy";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const GET = (request: NextRequest) =>
  proxyApiRequest(request, "interest-points/kinds", "interest point kinds");
