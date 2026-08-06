import { NextRequest, NextResponse } from "next/server";
import { getSkillGap } from "@/lib/queries";
import { withErrorHandling, parseSkillsParam } from "@/lib/api-helpers";

// GET /api/skill-gap?skills=<comma-separated skill names>&targetJob=<title>
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const skills = parseSkillsParam(request.nextUrl.searchParams.get("skills"));
    const targetJob = request.nextUrl.searchParams.get("targetJob");

    if (!targetJob) {
      return NextResponse.json(
        { error: "Query param 'targetJob' is required." },
        { status: 400 }
      );
    }

    const result = await getSkillGap(skills, targetJob);
    return NextResponse.json(result);
  });
}
