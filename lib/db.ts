/**
 * Global reference used to persist the connection pool across hot reloads
 * in development. Without this, each reload would create a new pool,
 * eventually exhausting available database connections.
 */
import { Pool } from 'pg';

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

export const pool = globalForDb.pool ?? new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'oddsdb',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'user',
  max: 10, // At most 10 active db connections at the same time
  idleTimeoutMillis: 30000, // Close a connection if unused for 30 seconds
  connectionTimeoutMillis: 5000, // Wait a maximum of 5 seconds when waitinf for a connection
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});