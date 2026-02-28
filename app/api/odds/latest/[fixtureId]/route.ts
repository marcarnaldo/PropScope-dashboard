import { addSnapshot } from "@/lib/oddsCache";
import { getLatestOdds } from "@/lib/queries/odds";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns the most recent odds snapshot for a fixture from the database.
 * Also appends the snapshot to the in-memory cache so subsequent
 * history requests stay up to date without a full DB re-fetch.
 *
 * Called by the OddsBoard when an SSE event signals new odds have
 * been scraped for a fixture.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;
  const id = parseInt(fixtureId);
  const odds = await getLatestOdds(id);
  if (odds) addSnapshot(id, odds);
  return NextResponse.json(odds);
}