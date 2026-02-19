import { NormalizedOdds } from "@/app/sports/nba/components/oddsBoard";
import { getOddsHistory } from "./queries/odds";

export interface OddsSnapshotRow {
  odds_data: string | NormalizedOdds;
  snapshot_time: string;
}
const cache = new Map<number, OddsSnapshotRow[]>();

export function addSnapshot(fixtureId: number, oddsSnapshot: OddsSnapshotRow) {
  const existing = cache.get(fixtureId) ?? [];
  existing.push(oddsSnapshot);
  cache.set(fixtureId, existing);
}

export async function getCachedOdds(fixtureId: number) {
  if (cache.has(fixtureId)) {
    return cache.get(fixtureId);
  }

  const history = await getOddsHistory(fixtureId);
  cache.set(fixtureId, history);
  return history;
}

export function pruneCache(activeFixtureIds: number[]) {
  for (const key of cache.keys()) {
    if (!activeFixtureIds.includes(key)) {
      cache.delete(key);
    }
  }
}
