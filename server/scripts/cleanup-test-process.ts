import { getDbPool } from '../db';

async function main() {
  const db = getDbPool();
  if (!db) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const result = await db.query(
    "DELETE FROM reurb_processes WHERE cadastral_code = 'PRD-001'",
  );

  console.log({ deleted: result.rowCount });
  await db.end();
}

main().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
