"use server";

import { pool } from "../db";

/**
 * Fetches the most recent odds snapshot for a given fixture.
 * Returns only the latest entry by sorting on snapshot_time descending and limiting to 1.
 *
 * @param {number} fixtureId - The unique identifier of the fixture.
 * @returns {Promise<{odds_data: string, snapshot_time: string} | null>}
 *          The latest odds snapshot row, or null if none exist for this fixture.
 */
export async function getLatestOdds(fixtureId: number) {
  const result = await pool.query(
    /* SQL */
    `SELECT odds_data, snapshot_time
     FROM odds_snapshots
     WHERE fixture_id = $1
     ORDER BY snapshot_time DESC
     LIMIT 1`,
    [fixtureId],
  );

  return result.rows[0] ?? null;
}

/**
 * Fetches the full odds history for a given fixture, sorted chronologically.
 * Each row represents a snapshot taken at a different point in time,
 * allowing line movement tracking over the life of the fixture.
 *
 * @param {number} fixtureId - The unique identifier of the fixture.
 * @returns {Promise<Array<{odds_data: string, snapshot_time: string}>>}
 *          All odds snapshots for this fixture, oldest first.
 */
export async function getOddsHistory(fixtureId: number) {
  const result = await pool.query(
    /* SQL */
    `SELECT odds_data, snapshot_time
     FROM odds_snapshots
     WHERE fixture_id = $1
     ORDER BY snapshot_time ASC`,
    [fixtureId],
  );

  return result.rows;
}