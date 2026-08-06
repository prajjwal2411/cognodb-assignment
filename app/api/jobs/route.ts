import { NextResponse } from "next/server";
import { listJobs } from "@/lib/queries";
import { withErrorHandling } from "@/lib/api-helpers";

export async function GET() {
  return withErrorHandling(async () => {
    const jobs = await listJobs();
    return NextResponse.json({ jobs });
  });
}
