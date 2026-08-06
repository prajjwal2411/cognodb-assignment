import { NextResponse } from "next/server";

/**
 * Wraps an API route handler so any error (e.g. CognoDB unreachable, bad
 * credentials, timeout) becomes a clean JSON 503/500 response instead of a
 * stack trace, per the "graceful error handling" requirement.
 */
export function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().catch((err) => {
    console.error("API error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error";
    const unreachable =
      message.toLowerCase().includes("econnrefused") ||
      message.toLowerCase().includes("unable to retrieve") ||
      message.toLowerCase().includes("failed to establish");

    return NextResponse.json(
      {
        error: unreachable
          ? "Could not reach the database. Please try again shortly."
          : "Something went wrong while fetching data.",
      },
      { status: unreachable ? 503 : 500 }
    );
  });
}

/**
 * Parses a comma-separated `skills` query param (e.g. "React,Node.js") into
 * a trimmed, non-empty string array. Returns [] if the param is missing.
 */
export function parseSkillsParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
