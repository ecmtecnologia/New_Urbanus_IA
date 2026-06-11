import { getDbPool } from '../db';

async function main() {
  const db = getDbPool();
  if (!db) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const result = await db.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('app_users', 'reurb_processes', 'ged_documents', 'aisha_analysis_logs')
    ORDER BY table_name;
  `);

  console.log(result.rows);
  await db.end();
}

main().catch((error) => {
  console.error('List tables failed:', error);
  process.exit(1);
});
