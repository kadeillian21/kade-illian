/**
 * Database connection singleton for serverless environments
 * Reuses connection pool across requests
 */

import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!sql) {
    const connectionString = process.env.POSTGRES_URL!;

    sql = postgres(connectionString, {
      max: 10, // Increased pool size for better concurrency
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase pooler
      },
    });
  }
  return sql;
}
