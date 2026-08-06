import { NextRequest, NextResponse } from "next/server";
import { getCompanyRecommendations } from "@/lib/queries";
import { withErrorHandling, parseSkillsParam } from "@/lib/api-helpers";

// GET /api/company-recommendations?skills=<comma-separated skill names>&minShared=<number>
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const skills = parseSkillsParam(request.nextUrl.searchParams.get("skills"));
    const minSharedParam = request.nextUrl.searchParams.get("minShared");
    const minShared = minSharedParam ? Number(minSharedParam) : 2;

    if (skills.length === 0) {
      return NextResponse.json(
        { error: "Query param 'skills' is required." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(minShared) || minShared < 1) {
      return NextResponse.json(
        { error: "'minShared' must be a positive number." },
        { status: 400 }
      );
    }

    const companies = await getCompanyRecommendations(skills, minShared);
    return NextResponse.json({ companies });
  });
}
