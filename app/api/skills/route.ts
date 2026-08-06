import { NextResponse } from "next/server";
import { listSkills } from "@/lib/queries";
import { withErrorHandling } from "@/lib/api-helpers";

export async function GET() {
  return withErrorHandling(async () => {
    const skills = await listSkills();
    return NextResponse.json({ skills });
  });
}
