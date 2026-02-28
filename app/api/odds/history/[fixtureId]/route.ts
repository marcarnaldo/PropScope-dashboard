import { getCachedOdds } from "@/lib/oddsCache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns the full odds snapshot history for a fixture.
 * Serves from the in-memory cache when available, otherwise
 * falls back to the database via getCachedOdds.
 *
 * Used by client components (OddsChart, GapChart) to render
 * line movement over time.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;
  const history = await getCachedOdds(parseInt(fixtureId));
  return NextResponse.json(history ?? []);
}