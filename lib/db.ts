/**
 * Database connection singleton for serverless environments
 * Reuses connection pool across requests
 */

import postgres from 'postgres';

let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!sql) {
    sql = postgres(process.env.POSTGRES_URL!, {
      max: 1, // Limit connection pool size for serverless
    });
  }
  return sql;
}
