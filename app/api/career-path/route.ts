import { NextRequest, NextResponse } from "next/server";
import { getCareerPath } from "@/lib/queries";
import { withErrorHandling } from "@/lib/api-helpers";

// GET /api/career-path?currentTitle=<job title>&targetJob=<title>
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const currentTitle = request.nextUrl.searchParams.get("currentTitle");
    const targetJob = request.nextUrl.searchParams.get("targetJob");

    if (!currentTitle || !targetJob) {
      return NextResponse.json(
        { error: "Query params 'currentTitle' and 'targetJob' are required." },
        { status: 400 }
      );
    }

    const result = await getCareerPath(currentTitle, targetJob);
    return NextResponse.json(result);
  });
}
