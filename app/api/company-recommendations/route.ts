import { NextRequest, NextResponse } from "next/server";
import { getCompanyRecommendations } from "@/lib/queries";
import { withErrorHandling } from "@/lib/api-helpers";

// GET /api/company-recommendations?person=<name>&minShared=<number>
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const person = request.nextUrl.searchParams.get("person");
    const minSharedParam = request.nextUrl.searchParams.get("minShared");
    const minShared = minSharedParam ? Number(minSharedParam) : 2;

    if (!person) {
      return NextResponse.json(
        { error: "Query param 'person' is required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(minShared) || minShared < 1) {
      return NextResponse.json(
        { error: "'minShared' must be a positive number." },
        { status: 400 }
      );
    }

    const companies = await getCompanyRecommendations(person, minShared);
    return NextResponse.json({ companies });
  });
}
