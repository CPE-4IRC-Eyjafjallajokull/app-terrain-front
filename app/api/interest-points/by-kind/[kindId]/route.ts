import { auth } from "@/auth";
import { serverEnv } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ kindId: string }>;
};

/**
 * GET /api/interest-points/by-kind/[kindId] -> Proxifié vers /terrain/interest-points/{kindId}
 * Liste les points d'intérêt par type
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kindId } = await params;
  const target = `${serverEnv.API_URL}/terrain/interest-points/${kindId}`;

  try {
    const upstream = await fetch(target, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const responseBody = await upstream.text();
    const contentType =
      upstream.headers.get("content-type") ?? "application/json";

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    console.error("Interest points by kind proxy error", error);
    return NextResponse.json(
      { error: "Error while reaching interest points by kind" },
      { status: 502 },
    );
  }
}
