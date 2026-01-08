import { auth } from "@/auth";
import { serverEnv } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ kindId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  let accessToken = session?.accessToken;

  // Allow requests without auth token in development when auth is disabled
  if (!accessToken && process.env.NEXT_PUBLIC_DISABLE_AUTH !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use a dummy token for local development
  if (!accessToken && process.env.NEXT_PUBLIC_DISABLE_AUTH === "1") {
    accessToken = "dev-token";
  }

  const { kindId } = await params;
  const targetUrl = new URL(
    `${serverEnv.API_URL}/terrain/interest-points/${encodeURIComponent(kindId)}`,
  );

  console.debug(`Proxying interest-points by-kind to: ${targetUrl.toString()}`);

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

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
