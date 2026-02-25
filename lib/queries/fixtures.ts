"use server";

import { pool } from "../db";

/**
 * Fetches all fixtures from the database, regardless of status.
 * Results are sorted by start date in ascending order.
 *
 * Potential use: pagination to browse all games (open or closed).
 *
 * @returns {Promise<Array<{fixture_id: number, home_team: string, away_team: string, start_date: string, status: string}>>}
 */
export async function getAllFixtures() {
  const result = await pool.query(
    /* SQL */
    `SELECT fixture_id, home_team, away_team, start_date, status
     FROM fixtures
     ORDER BY start_date ASC`,
  );

  return result.rows;
}

/**
 * Fetches all fixtures with an 'open' status, sorted by start date ascending.
 * These are games that haven't finished yet and are highlighted on the main NBA page.
 *
 * @returns {Promise<Array<{fixture_id: number, home_team: string, away_team: string, start_date: string, status: string}>>}
 */
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

/**
 * Fetches all fixtures with a 'close' status, sorted by start date ascending.
 * Used for viewing finished games.
 *
 * @returns {Promise<Array<{fixture_id: number, home_team: string, away_team: string, start_date: string, status: string}>>}
 */
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

/**
 * Fetches a single fixture by its ID.
 *
 * @param {number} fixtureId - The unique identifier of the fixture.
 * @returns {Promise<{fixture_id: number, home_team: string, away_team: string, start_date: string, status: string} | null>}
 *          The fixture row, or null if not found.
 */
export async function getFixtureById(fixtureId: number) {
  const result = await pool.query(
    /* SQL */
    `
    SELECT fixture_id, home_team, away_team, start_date, status
    FROM fixtures
    WHERE fixture_id = $1`,
    [fixtureId],
  );

  return result.rows[0] ?? null;
}