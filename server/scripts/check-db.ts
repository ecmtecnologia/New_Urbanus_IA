import { getDbPool } from '../db';

async function main() {
  const db = getDbPool();
  if (!db) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const result = await db.query('SELECT version()');
  console.log(result.rows[0]);
  await db.end();
}

main().catch((error) => {
  console.error('Database check failed:', error);
  process.exit(1);
});
