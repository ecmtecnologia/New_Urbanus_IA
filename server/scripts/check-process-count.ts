import { getDbPool } from '../db';

async function main() {
  const db = getDbPool();
  if (!db) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const result = await db.query(
    "SELECT count(*)::int AS total FROM reurb_processes WHERE cadastral_code = 'PRD-001'",
  );

  console.log(result.rows[0]);
  await db.end();
}

main().catch((error) => {
  console.error('Count check failed:', error);
  process.exit(1);
});
