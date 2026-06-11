import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth';
import { getDbPool, insertSecurityAuditLog } from '../db';

const zoneSchema = z.object({
  name: z.string(),
  type: z.enum(['ZEIS', 'ZR', 'ZC', 'ZUE', 'RURAL']),
  description: z.string().optional(),
  min_lot_area_sqm: z.number().optional(),
  max_height_meters: z.number().optional(),
});

const sectorSchema = z.object({
  zone_id: z.string().uuid(),
  name: z.string(),
  responsible_tech_id: z.string().uuid().optional(),
});

const blockSchema = z.object({
  sector_id: z.string().uuid(),
  designation: z.string(),
  registry_number: z.string().optional(),
  total_area_sqm: z.number().optional(),
});

const propertySchema = z.object({
  block_id: z.string().uuid().optional(),
  cadastral_code: z.string(),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_zip: z.string().optional(),
  area_sqm: z.number(),
  status: z.string().default('PENDENTE'),
});

export const territoryRouter = Router();
territoryRouter.use(requireAuth);

// ZONES
territoryRouter.get('/zones', async (_req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const result = await db.query(
    'SELECT id, name, type, description, min_lot_area_sqm, max_height_meters, created_at FROM territory_zones ORDER BY created_at DESC'
  );
  res.json({ items: result.rows });
});

territoryRouter.post('/zones', async (req, res) => {
  const parsed = zoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid zone payload.', details: parsed.error.flatten() });
  }

  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const { name, type, description, min_lot_area_sqm, max_height_meters } = parsed.data;
  const result = await db.query(
    `INSERT INTO territory_zones (name, type, description, min_lot_area_sqm, max_height_meters)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, type, description, min_lot_area_sqm, max_height_meters, created_at`,
    [name, type, description, min_lot_area_sqm, max_height_meters]
  );

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'territory.zone.create',
    resource: 'territory_zone',
    resourceId: String(result.rows[0].id),
    status: 'success',
    ipAddress: req.ip,
    details: { name, type },
  });

  res.status(201).json(result.rows[0]);
});

territoryRouter.put('/zones/:id', async (req, res) => {
  const parsed = zoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid zone payload.', details: parsed.error.flatten() });
  }

  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const { id } = req.params;
  const { name, type, description, min_lot_area_sqm, max_height_meters } = parsed.data;

  const result = await db.query(
    `UPDATE territory_zones SET name = $2, type = $3, description = $4, min_lot_area_sqm = $5, max_height_meters = $6
     WHERE id = $1
     RETURNING id, name, type, description, min_lot_area_sqm, max_height_meters, created_at`,
    [id, name, type, description, min_lot_area_sqm, max_height_meters]
  );

  if (!result.rowCount) {
    return res.status(404).json({ error: 'Zone not found.' });
  }

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'territory.zone.update',
    resource: 'territory_zone',
    resourceId: id,
    status: 'success',
    ipAddress: req.ip,
    details: { name, type },
  });

  res.json(result.rows[0]);
});

territoryRouter.delete('/zones/:id', async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const { id } = req.params;
  const result = await db.query('DELETE FROM territory_zones WHERE id = $1', [id]);

  if (!result.rowCount) {
    return res.status(404).json({ error: 'Zone not found.' });
  }

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'territory.zone.delete',
    resource: 'territory_zone',
    resourceId: id,
    status: 'success',
    ipAddress: req.ip,
  });

  res.status(204).send();
});

// SECTORS
territoryRouter.get('/sectors', async (_req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const result = await db.query(
    'SELECT id, zone_id, name, responsible_tech_id, created_at FROM territory_sectors ORDER BY created_at DESC'
  );
  res.json({ items: result.rows });
});

territoryRouter.post('/sectors', async (req, res) => {
  const parsed = sectorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid sector payload.', details: parsed.error.flatten() });
  }

  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const { zone_id, name, responsible_tech_id } = parsed.data;
  const result = await db.query(
    `INSERT INTO territory_sectors (zone_id, name, responsible_tech_id)
     VALUES ($1, $2, $3)
     RETURNING id, zone_id, name, responsible_tech_id, created_at`,
    [zone_id, name, responsible_tech_id]
  );

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'territory.sector.create',
    resource: 'territory_sector',
    resourceId: String(result.rows[0].id),
    status: 'success',
    ipAddress: req.ip,
    details: { name, zone_id },
  });

  res.status(201).json(result.rows[0]);
});

// BLOCKS
territoryRouter.get('/blocks', async (_req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const result = await db.query(
    'SELECT id, sector_id, designation, registry_number, total_area_sqm FROM territory_blocks ORDER BY designation ASC'
  );
  res.json({ items: result.rows });
});

territoryRouter.post('/blocks', async (req, res) => {
  const parsed = blockSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid block payload.', details: parsed.error.flatten() });
  }

  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const { sector_id, designation, registry_number, total_area_sqm } = parsed.data;
  const result = await db.query(
    `INSERT INTO territory_blocks (sector_id, designation, registry_number, total_area_sqm)
     VALUES ($1, $2, $3, $4)
     RETURNING id, sector_id, designation, registry_number, total_area_sqm`,
    [sector_id, designation, registry_number, total_area_sqm]
  );

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'territory.block.create',
    resource: 'territory_block',
    resourceId: String(result.rows[0].id),
    status: 'success',
    ipAddress: req.ip,
    details: { designation, sector_id },
  });

  res.status(201).json(result.rows[0]);
});

// PROPERTIES
territoryRouter.get('/properties', async (_req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const result = await db.query(
    `SELECT id, block_id, cadastral_code, address_street, address_number, address_zip, area_sqm, status, created_at
     FROM properties ORDER BY created_at DESC LIMIT 1000`
  );
  res.json({ items: result.rows });
});

territoryRouter.post('/properties', async (req, res) => {
  const parsed = propertySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid property payload.', details: parsed.error.flatten() });
  }

  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const { block_id, cadastral_code, address_street, address_number, address_zip, area_sqm, status } = parsed.data;
  const result = await db.query(
    `INSERT INTO properties (block_id, cadastral_code, address_street, address_number, address_zip, area_sqm, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, block_id, cadastral_code, address_street, address_number, address_zip, area_sqm, status, created_at`,
    [block_id, cadastral_code, address_street, address_number, address_zip, area_sqm, status]
  );

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'territory.property.create',
    resource: 'property',
    resourceId: String(result.rows[0].id),
    status: 'success',
    ipAddress: req.ip,
    details: { cadastral_code, area_sqm },
  });

  res.status(201).json(result.rows[0]);
});

territoryRouter.delete('/properties/:id', async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const { id } = req.params;
  const result = await db.query('DELETE FROM properties WHERE id = $1', [id]);

  if (!result.rowCount) {
    return res.status(404).json({ error: 'Property not found.' });
  }

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'territory.property.delete',
    resource: 'property',
    resourceId: id,
    status: 'success',
    ipAddress: req.ip,
  });

  res.status(204).send();
});
