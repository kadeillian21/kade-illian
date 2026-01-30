import { getDb } from '../lib/db';

async function checkTimer() {
  const sql = getDb();

  console.log('=== Checking Timer Data ===\n');

  // Get all recent sessions
  const sessions = await sql`
    SELECT
      id,
      user_id,
      mode,
      start_time,
      end_time,
      duration_seconds,
      DATE(start_time) as session_date,
      CURRENT_DATE as today,
      DATE(start_time) = CURRENT_DATE as is_today
    FROM study_sessions
    WHERE end_time IS NOT NULL
    ORDER BY start_time DESC
    LIMIT 10
  `;

  console.log('Recent sessions:');
  console.table(sessions);

  // Get today's total (current logic)
  const todayTotal = await sql`
    SELECT COALESCE(SUM(duration_seconds), 0) as total_seconds
    FROM study_sessions
    WHERE DATE(start_time) = CURRENT_DATE
      AND end_time IS NOT NULL
  `;

  console.log('\nToday\'s total (current logic):', todayTotal[0].total_seconds, 'seconds');

  // Get timezone info
  const tzInfo = await sql`
    SELECT
      CURRENT_TIMESTAMP as db_time,
      CURRENT_DATE as db_date,
      NOW() as db_now
  `;

  console.log('\nDatabase timezone info:');
  console.log(tzInfo[0]);

  process.exit(0);
}

checkTimer().catch(console.error);
