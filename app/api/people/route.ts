import { NextResponse } from "next/server";
import { listPeople } from "@/lib/queries";
import { withErrorHandling } from "@/lib/api-helpers";

export async function GET() {
  return withErrorHandling(async () => {
    const people = await listPeople();
    return NextResponse.json({ people });
  });
}
