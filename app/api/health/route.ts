import { NextResponse } from "next/server";
import { verifyConnectivity } from "@/lib/neo4j";

// Simple endpoint to confirm the app can reach CognoDB. Useful for smoke-testing
// the deployed environment variables without exposing any query results.
export async function GET() {
  const connected = await verifyConnectivity();
  return NextResponse.json(
    { connected },
    { status: connected ? 200 : 503 }
  );
}
