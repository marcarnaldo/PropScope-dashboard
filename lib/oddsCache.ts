import { NormalizedOdds } from "@/app/sports/nba/components/oddsBoard";
import { getOddsHistory } from "./queries/odds";

export interface OddsSnapshotRow {
  odds_data: string | NormalizedOdds;
  snapshot_time: string;
}

/**
 * In-memory cache that maps fixture IDs to their array of odds snapshots.
 * Avoids redundant database calls when the same fixture's odds are
 * requested multiple times within the same server lifecycle.
 */
const cache = new Map<number, OddsSnapshotRow[]>();

/**
 * Appends a new odds snapshot to the cached history for a fixture.
 * Called when an SSE event signals that fresh odds have been scraped
 * and saved to the database.
 *
 * @param fixtureId - The fixture to update in the cache.
 * @param oddsSnapshot - The new snapshot to append.
 */
export function addSnapshot(fixtureId: number, oddsSnapshot: OddsSnapshotRow) {
  const existing = cache.get(fixtureId) ?? [];
  existing.push(oddsSnapshot);
  cache.set(fixtureId, existing);
}

/**
 * Returns the full odds history for a fixture, serving from cache when
 * available. On a cache miss, fetches all snapshots from the database
 * via getOddsHistory and populates the cache before returning.
 *
 * @param fixtureId - The fixture to look up.
 * @returns The complete snapshot history for this fixture.
 */
export async function getCachedOdds(fixtureId: number) {
  const cached = cache.get(fixtureId);
  if (cached && cached.length > 0) {
    return cached;
  }
  const history = await getOddsHistory(fixtureId);
  cache.set(fixtureId, history);
  return history;
}
