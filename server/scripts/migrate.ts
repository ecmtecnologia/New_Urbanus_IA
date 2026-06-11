import fs from 'node:fs';
import path from 'node:path';
import { getDbPool } from '../db';

async function main() {
  const db = getDbPool();
  if (!db) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const migrationsDir = path.resolve(process.cwd(), 'database/migrations');
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, 'utf-8');

    console.log(`Running migration: ${file}`);
    await db.query(sql);
  }

  console.log('Migrations completed successfully.');
  await db.end();
}

main().catch((error) => {
  console.error('Migration error:', error);
  process.exit(1);
});
