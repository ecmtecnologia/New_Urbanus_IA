import { Pool } from 'pg';
import { env } from './env';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  if (!env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
    });
  }

  return pool;
}

export async function checkDbHealth(): Promise<boolean> {
  const db = getDbPool();
  if (!db) {
    return false;
  }

  try {
    await db.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export interface AishaAuditLogInput {
  processId?: string;
  modelType: 'fast' | 'deep';
  requestPayload: unknown;
  responsePayload?: unknown;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface SecurityAuditLogInput {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failed';
  ipAddress?: string;
  details?: unknown;
}

export async function insertAishaAuditLog(input: AishaAuditLogInput): Promise<void> {
  const db = getDbPool();
  if (!db) {
    return;
  }

  await db.query(
    `
    INSERT INTO aisha_analysis_logs (
      process_id,
      model_type,
      request_payload,
      response_payload,
      status,
      error_message
    ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6)
    `,
    [
      input.processId ?? null,
      input.modelType,
      JSON.stringify(input.requestPayload ?? {}),
      JSON.stringify(input.responsePayload ?? null),
      input.status,
      input.errorMessage ?? null,
    ],
  );
}

export async function insertSecurityAuditLog(input: SecurityAuditLogInput): Promise<void> {
  const db = getDbPool();
  if (!db) {
    return;
  }

  await db.query(
    `
    INSERT INTO security_audit_logs (
      user_id,
      action,
      resource,
      resource_id,
      status,
      ip_address,
      details
    ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [
      input.userId ?? null,
      input.action,
      input.resource,
      input.resourceId ?? null,
      input.status,
      input.ipAddress ?? null,
      JSON.stringify(input.details ?? {}),
    ],
  );
}
