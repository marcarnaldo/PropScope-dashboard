/* Querying fixtures table*/

"use server";

import { pool } from "../db";

// Just in case I want to have a pagination to look at all the games open or close. Probably irrelevant. Might delete later.
export async function getAllFixtures() {
  const result = await pool.query(
    /* SQL */
    `SELECT fixture_id, home_team, away_team, start_date, status
     FROM fixtures
     ORDER BY start_date ASC`,
  );

  return result.rows;
}

// I will have a section for still open games and this will be the one being highlighted in the main page of nba
// export async function getTodaysOpenFixtures() {
//   const result = await pool.query(
//     /* SQL */
//     `
//     SELECT fixture_id, home_team, away_team, start_date, status
//     FROM fixtures
//     WHERE start_date::date = CURRENT_DATE 2026-02-19 16:40:00.000 -0800
//     AND status = 'open'
//     ORDER BY start_date ASC`,
//   );

//   return result.rows;
// }

export async function getTodaysOpenFixtures() {
  const result = await pool.query(
    /* SQL */
    `
    SELECT fixture_id, home_team, away_team, start_date, status
    FROM fixtures
    WHERE status = 'open'
    ORDER BY start_date ASC`,
  );

  return result.rows;
}

// I will have a section for closed games in the event I want to look at games that are finished
export async function getTodaysCloseFixtures() {
  const result = await pool.query(
    /* SQL */
    `
    SELECT fixture_id, home_team, away_team, start_date, status
    FROM fixtures
    WHERE status = 'close'
    ORDER BY start_date ASC`,
  );
  return result.rows;
}
