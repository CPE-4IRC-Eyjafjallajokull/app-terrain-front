import { NextRequest, NextResponse } from "next/server";
import { proxyApiRequest } from "@/lib/api-proxy";

/**
 * POST /api/incidents/assignment-proposals/request
 * Proxy vers /qg/assignment-proposals/request pour demander une proposition d'affectation
 */
export async function POST(request: NextRequest) {
  return proxyApiRequest(request, "qg/assignment-proposals/request", {
    method: "POST",
  });
}
