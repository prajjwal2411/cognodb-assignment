import { NextRequest, NextResponse } from "next/server";
import { getCareerPath } from "@/lib/queries";
import { withErrorHandling } from "@/lib/api-helpers";

// GET /api/career-path?person=<name>&targetJob=<title>
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const person = request.nextUrl.searchParams.get("person");
    const targetJob = request.nextUrl.searchParams.get("targetJob");

    if (!person || !targetJob) {
      return NextResponse.json(
        { error: "Query params 'person' and 'targetJob' are required." },
        { status: 400 }
      );
    }

    const result = await getCareerPath(person, targetJob);
    return NextResponse.json(result);
  });
}
