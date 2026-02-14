/* Querying the odds_snapshot table*/
"use server";

import { pool } from "../db";

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
