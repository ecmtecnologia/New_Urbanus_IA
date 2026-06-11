import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth';
import { getDbPool, insertSecurityAuditLog } from '../db';

const processPayloadSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  type: z.string(),
  status: z.string(),
  neighborhood: z.string(),
  riskLevel: z.enum(['Low', 'Medium', 'High']).default('Low'),
  property: z.object({
    cadastralCode: z.string(),
  }).passthrough(),
}).passthrough();

function mapRowToProcess(row: any) {
  const data = row.data ?? {};

  return {
    ...data,
    id: String(row.id),
    title: data.title ?? row.title,
    type: data.type ?? row.reurb_type,
    status: data.status ?? row.status,
    neighborhood: data.neighborhood ?? row.neighborhood,
    riskLevel: data.riskLevel ?? row.risk_level ?? 'Low',
  };
}

export const processRouter = Router();

processRouter.use(requireAuth);

processRouter.get('/', async (_req, res) => {
  const db = getDbPool();
  if (!db) {
    return res.status(503).json({ error: 'Database unavailable.' });
  }

  const result = await db.query(
    `
    SELECT id, title, reurb_type, status, neighborhood, risk_level, data, created_at
    FROM reurb_processes
    ORDER BY created_at DESC
    `,
  );

  return res.json({ items: result.rows.map(mapRowToProcess) });
});

processRouter.post('/', async (req, res) => {
  const parsed = processPayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid process payload.',
      details: parsed.error.flatten(),
    });
  }

  const db = getDbPool();
  if (!db) {
    return res.status(503).json({ error: 'Database unavailable.' });
  }

  const processData = parsed.data;

  const inserted = await db.query(
    `
    INSERT INTO reurb_processes (
      external_id,
      title,
      reurb_type,
      status,
      cadastral_code,
      neighborhood,
      risk_level,
      data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
    RETURNING id, title, reurb_type, status, neighborhood, risk_level, data, created_at
    `,
    [
      processData.id ?? null,
      processData.title,
      processData.type,
      processData.status,
      processData.property.cadastralCode,
      processData.neighborhood,
      processData.riskLevel,
      JSON.stringify(processData),
    ],
  );

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'process.create',
    resource: 'reurb_process',
    resourceId: String(inserted.rows[0].id),
    status: 'success',
    ipAddress: req.ip,
    details: { title: processData.title, type: processData.type },
  });

  return res.status(201).json(mapRowToProcess(inserted.rows[0]));
});

processRouter.put('/:id', async (req, res) => {
  const parsed = processPayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid process payload.',
      details: parsed.error.flatten(),
    });
  }

  const db = getDbPool();
  if (!db) {
    return res.status(503).json({ error: 'Database unavailable.' });
  }

  const processData = parsed.data;
  const { id } = req.params;

  const updated = await db.query(
    `
    UPDATE reurb_processes
    SET title = $2,
        reurb_type = $3,
        status = $4,
        cadastral_code = $5,
        neighborhood = $6,
        risk_level = $7,
        data = $8::jsonb,
        updated_at = now()
    WHERE id = $1
    RETURNING id, title, reurb_type, status, neighborhood, risk_level, data, created_at
    `,
    [
      id,
      processData.title,
      processData.type,
      processData.status,
      processData.property.cadastralCode,
      processData.neighborhood,
      processData.riskLevel,
      JSON.stringify(processData),
    ],
  );

  if (!updated.rowCount) {
    await insertSecurityAuditLog({
      userId: req.user?.id,
      action: 'process.update',
      resource: 'reurb_process',
      resourceId: id,
      status: 'failed',
      ipAddress: req.ip,
      details: { reason: 'not_found' },
    });
    return res.status(404).json({ error: 'Process not found.' });
  }

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'process.update',
    resource: 'reurb_process',
    resourceId: id,
    status: 'success',
    ipAddress: req.ip,
    details: { title: processData.title, type: processData.type },
  });

  return res.json(mapRowToProcess(updated.rows[0]));
});

processRouter.delete('/:id', async (req, res) => {
  const db = getDbPool();
  if (!db) {
    return res.status(503).json({ error: 'Database unavailable.' });
  }

  const result = await db.query('DELETE FROM reurb_processes WHERE id = $1', [req.params.id]);

  if (!result.rowCount) {
    await insertSecurityAuditLog({
      userId: req.user?.id,
      action: 'process.delete',
      resource: 'reurb_process',
      resourceId: req.params.id,
      status: 'failed',
      ipAddress: req.ip,
      details: { reason: 'not_found' },
    });
    return res.status(404).json({ error: 'Process not found.' });
  }

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'process.delete',
    resource: 'reurb_process',
    resourceId: req.params.id,
    status: 'success',
    ipAddress: req.ip,
  });

  return res.status(204).send();
});
