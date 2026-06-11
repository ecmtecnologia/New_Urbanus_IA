import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../auth';
import { getDbPool, insertSecurityAuditLog } from '../db';

const familyMemberSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  relation: z.string().min(1),
  cpf: z.string().optional(),
  birth_date: z.string().optional(),
});

const occupantContactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().optional(),
  is_primary: z.boolean().optional(),
});

const occupantDocumentSchema = z.object({
  document_type: z.string().min(1),
  document_number: z.string().optional(),
  file_name: z.string().optional(),
  file_url: z.string().optional(),
});

const occupantAddressSchema = z.object({
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  zip_code: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

const occupantSchema = z.object({
  process_id: z.string().uuid().optional(),
  property_id: z.string().uuid().optional(),
  name: z.string().min(1),
  cpf: z.string().min(1),
  rg: z.string().optional(),
  birth_date: z.string().optional(),
  civil_status: z.string().optional(),
  monthly_income: z.number().optional(),
  nis_number: z.string().optional(),
  profession: z.string().optional(),
  education_level: z.string().optional(),
  family_members_count: z.number().int().optional(),
  spouse_data: z.unknown().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  signature_data: z.string().optional(),
  members: z.array(familyMemberSchema).optional(),
  contacts: z.array(occupantContactSchema).optional(),
  documents: z.array(occupantDocumentSchema).optional(),
  address: occupantAddressSchema.optional(),
});

const listOccupantsQuerySchema = z.object({
  property_id: z.string().uuid().optional(),
  process_id: z.string().uuid().optional(),
});

const occupantUploadSchema = z.object({
  document_type: z.string().min(1),
  document_number: z.string().optional(),
});

const uploadRoot = path.resolve(process.cwd(), 'uploads', 'occupants');
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({ storage });

async function hydrateOccupants(db: any, occupants: any[]) {
  if (!occupants.length) {
    return [];
  }

  const occupantIds = occupants.map((row) => row.id);
  const [membersResult, contactsResult, documentsResult, addressesResult] = await Promise.all([
    db.query(
      `SELECT id, occupant_id, name, relation, cpf, birth_date
       FROM family_members
       WHERE occupant_id = ANY($1::uuid[])
       ORDER BY name ASC`,
      [occupantIds]
    ),
    db.query(
      `SELECT id, occupant_id, phone, email, is_primary
       FROM occupant_contacts
       WHERE occupant_id = ANY($1::uuid[])
       ORDER BY is_primary DESC, created_at ASC`,
      [occupantIds]
    ),
    db.query(
      `SELECT od.id,
              od.occupant_id,
              od.document_type,
              od.document_number,
              od.file_name,
              od.file_url,
              od.created_at,
              gd.id AS ged_document_id,
              gd.status AS ged_status,
              gd.current_version AS ged_current_version
       FROM occupant_documents od
       LEFT JOIN LATERAL (
         SELECT id, status, current_version
         FROM ged_documents gd
         WHERE gd.metadata->>'occupant_document_id' = od.id::text
         ORDER BY gd.created_at DESC
         LIMIT 1
       ) gd ON true
       WHERE occupant_id = ANY($1::uuid[])
       ORDER BY od.created_at DESC`,
      [occupantIds]
    ),
    db.query(
      `SELECT id, occupant_id, street, number, complement, neighborhood, zip_code, city, state
       FROM occupant_addresses
       WHERE occupant_id = ANY($1::uuid[])
       ORDER BY created_at DESC`,
      [occupantIds]
    ),
  ]);

  const groupByOccupant = (rows: any[]) => {
    const grouped = new Map<string, any[]>();
    for (const row of rows) {
      const key = String(row.occupant_id);
      const current = grouped.get(key) ?? [];
      current.push(row);
      grouped.set(key, current);
    }
    return grouped;
  };

  const membersByOccupant = groupByOccupant(membersResult.rows);
  const contactsByOccupant = groupByOccupant(contactsResult.rows);
  const documentsByOccupant = groupByOccupant(documentsResult.rows);
  const addressesByOccupant = groupByOccupant(addressesResult.rows);

  return occupants.map((occupant) => ({
    ...occupant,
    members: membersByOccupant.get(String(occupant.id)) ?? [],
    contacts: contactsByOccupant.get(String(occupant.id)) ?? [],
    documents: documentsByOccupant.get(String(occupant.id)) ?? [],
    address: (addressesByOccupant.get(String(occupant.id)) ?? [])[0] ?? null,
  }));
}

export const familiesRouter = Router();
familiesRouter.use(requireAuth);

familiesRouter.get('/occupants', async (req, res) => {
  const queryParsed = listOccupantsQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    return res.status(400).json({ error: 'Invalid query params.', details: queryParsed.error.flatten() });
  }

  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const whereClauses: string[] = [];
  const params: any[] = [];

  if (queryParsed.data.property_id) {
    params.push(queryParsed.data.property_id);
    whereClauses.push(`o.property_id = $${params.length}`);
  }

  if (queryParsed.data.process_id) {
    params.push(queryParsed.data.process_id);
    whereClauses.push(`EXISTS (
      SELECT 1
      FROM reurb_process_occupants rpo
      WHERE rpo.reurb_process_id = $${params.length}
        AND rpo.occupant_id = o.id
    )`);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const occupantsResult = await db.query(
    `SELECT o.id, o.property_id, o.name, o.cpf, o.rg, o.birth_date, o.civil_status, o.monthly_income, o.nis_number,
            profession, education_level, family_members_count, spouse_data, phone, email, signature_data, created_at
     FROM occupants o
     ${whereSql}
     ORDER BY o.created_at DESC
     LIMIT 200`,
    params
  );

  const items = await hydrateOccupants(db, occupantsResult.rows);

  return res.json({ items });
});

familiesRouter.get('/occupants/:id', async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const occupantResult = await db.query(
    `SELECT id, property_id, name, cpf, rg, birth_date, civil_status, monthly_income, nis_number,
            profession, education_level, family_members_count, spouse_data, phone, email, signature_data, created_at
     FROM occupants
     WHERE id = $1`,
    [req.params.id]
  );

  if (!occupantResult.rowCount) {
    return res.status(404).json({ error: 'Occupant not found.' });
  }

  const items = await hydrateOccupants(db, occupantResult.rows);
  return res.json(items[0]);
});

familiesRouter.post('/occupants', async (req, res) => {
  const parsed = occupantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid occupant payload.', details: parsed.error.flatten() });
  }

  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const payload = parsed.data;
    const occupantResult = await client.query(
      `INSERT INTO occupants (
        property_id, name, cpf, rg, birth_date, civil_status, monthly_income, nis_number,
        profession, education_level, family_members_count, spouse_data, phone, email, signature_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12::jsonb, $13, $14, $15
      )
      RETURNING id, property_id, name, cpf, rg, birth_date, civil_status, monthly_income, nis_number,
                profession, education_level, family_members_count, spouse_data, phone, email, signature_data, created_at`,
      [
        payload.property_id ?? null,
        payload.name,
        payload.cpf,
        payload.rg ?? null,
        payload.birth_date ?? null,
        payload.civil_status ?? null,
        payload.monthly_income ?? null,
        payload.nis_number ?? null,
        payload.profession ?? null,
        payload.education_level ?? null,
        payload.family_members_count ?? null,
        JSON.stringify(payload.spouse_data ?? null),
        payload.phone ?? null,
        payload.email ?? null,
        payload.signature_data ?? null,
      ]
    );

    const occupant = occupantResult.rows[0];
    if (payload.process_id) {
      await client.query(
        `INSERT INTO reurb_process_occupants (reurb_process_id, occupant_id)
         VALUES ($1, $2)
         ON CONFLICT (reurb_process_id)
         DO UPDATE SET occupant_id = EXCLUDED.occupant_id, linked_at = now()`,
        [payload.process_id, occupant.id]
      );
    }

    const members = payload.members ?? [];
    const contacts = payload.contacts ?? [];
    const documents = payload.documents ?? [];
    const address = payload.address ?? null;

    for (const member of members) {
      await client.query(
        `INSERT INTO family_members (occupant_id, name, relation, cpf, birth_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [occupant.id, member.name, member.relation, member.cpf ?? null, member.birth_date ?? null]
      );
    }

    for (const contact of contacts) {
      await client.query(
        `INSERT INTO occupant_contacts (occupant_id, phone, email, is_primary)
         VALUES ($1, $2, $3, $4)`,
        [occupant.id, contact.phone ?? null, contact.email ?? null, contact.is_primary ?? false]
      );
    }

    for (const document of documents) {
      await client.query(
        `INSERT INTO occupant_documents (occupant_id, document_type, document_number, file_name, file_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          occupant.id,
          document.document_type,
          document.document_number ?? null,
          document.file_name ?? null,
          document.file_url ?? null,
        ]
      );
    }

    if (address) {
      await client.query(
        `INSERT INTO occupant_addresses (occupant_id, street, number, complement, neighborhood, zip_code, city, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          occupant.id,
          address.street ?? null,
          address.number ?? null,
          address.complement ?? null,
          address.neighborhood ?? null,
          address.zip_code ?? null,
          address.city ?? null,
          address.state ?? null,
        ]
      );
    }

    await client.query('COMMIT');

    await insertSecurityAuditLog({
      userId: req.user?.id,
      action: 'family.occupant.create',
      resource: 'occupant',
      resourceId: String(occupant.id),
      status: 'success',
      ipAddress: req.ip,
      details: {
        cpf: payload.cpf,
        processId: payload.process_id ?? null,
        membersCount: members.length,
        contactsCount: contacts.length,
        documentsCount: documents.length,
        hasAddress: !!address,
      },
    });

    const items = await hydrateOccupants(db, [occupant]);
    return res.status(201).json(items[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'CPF already registered.' });
    }
    throw error;
  } finally {
    client.release();
  }
});

familiesRouter.put('/occupants/:id', async (req, res) => {
  const parsed = occupantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid occupant payload.', details: parsed.error.flatten() });
  }

  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const payload = parsed.data;
    const updateResult = await client.query(
      `UPDATE occupants
       SET property_id = $2,
           name = $3,
           cpf = $4,
           rg = $5,
           birth_date = $6,
           civil_status = $7,
           monthly_income = $8,
           nis_number = $9,
           profession = $10,
           education_level = $11,
           family_members_count = $12,
           spouse_data = $13::jsonb,
           phone = $14,
           email = $15,
           signature_data = $16
       WHERE id = $1
       RETURNING id, property_id, name, cpf, rg, birth_date, civil_status, monthly_income, nis_number,
                 profession, education_level, family_members_count, spouse_data, phone, email, signature_data, created_at`,
      [
        id,
        payload.property_id ?? null,
        payload.name,
        payload.cpf,
        payload.rg ?? null,
        payload.birth_date ?? null,
        payload.civil_status ?? null,
        payload.monthly_income ?? null,
        payload.nis_number ?? null,
        payload.profession ?? null,
        payload.education_level ?? null,
        payload.family_members_count ?? null,
        JSON.stringify(payload.spouse_data ?? null),
        payload.phone ?? null,
        payload.email ?? null,
        payload.signature_data ?? null,
      ]
    );

    if (!updateResult.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Occupant not found.' });
    }

    await client.query('DELETE FROM family_members WHERE occupant_id = $1', [id]);

    if (payload.process_id) {
      await client.query(
        `INSERT INTO reurb_process_occupants (reurb_process_id, occupant_id)
         VALUES ($1, $2)
         ON CONFLICT (reurb_process_id)
         DO UPDATE SET occupant_id = EXCLUDED.occupant_id, linked_at = now()`,
        [payload.process_id, id]
      );
    }

    const members = payload.members ?? [];
    const contacts = payload.contacts ?? [];
    const documents = payload.documents ?? [];
    const address = payload.address ?? null;

    for (const member of members) {
      await client.query(
        `INSERT INTO family_members (occupant_id, name, relation, cpf, birth_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, member.name, member.relation, member.cpf ?? null, member.birth_date ?? null]
      );
    }

    await client.query('DELETE FROM occupant_contacts WHERE occupant_id = $1', [id]);
    for (const contact of contacts) {
      await client.query(
        `INSERT INTO occupant_contacts (occupant_id, phone, email, is_primary)
         VALUES ($1, $2, $3, $4)`,
        [id, contact.phone ?? null, contact.email ?? null, contact.is_primary ?? false]
      );
    }

    await client.query('DELETE FROM occupant_documents WHERE occupant_id = $1', [id]);
    for (const document of documents) {
      await client.query(
        `INSERT INTO occupant_documents (occupant_id, document_type, document_number, file_name, file_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          document.document_type,
          document.document_number ?? null,
          document.file_name ?? null,
          document.file_url ?? null,
        ]
      );
    }

    await client.query('DELETE FROM occupant_addresses WHERE occupant_id = $1', [id]);
    if (address) {
      await client.query(
        `INSERT INTO occupant_addresses (occupant_id, street, number, complement, neighborhood, zip_code, city, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          address.street ?? null,
          address.number ?? null,
          address.complement ?? null,
          address.neighborhood ?? null,
          address.zip_code ?? null,
          address.city ?? null,
          address.state ?? null,
        ]
      );
    }

    await client.query('COMMIT');

    await insertSecurityAuditLog({
      userId: req.user?.id,
      action: 'family.occupant.update',
      resource: 'occupant',
      resourceId: id,
      status: 'success',
      ipAddress: req.ip,
      details: {
        cpf: payload.cpf,
        processId: payload.process_id ?? null,
        membersCount: members.length,
        contactsCount: contacts.length,
        documentsCount: documents.length,
        hasAddress: !!address,
      },
    });

    const items = await hydrateOccupants(db, [updateResult.rows[0]]);
    return res.json(items[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'CPF already registered.' });
    }
    throw error;
  } finally {
    client.release();
  }
});

familiesRouter.delete('/occupants/:id', async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const result = await db.query('DELETE FROM occupants WHERE id = $1', [req.params.id]);
  if (!result.rowCount) {
    return res.status(404).json({ error: 'Occupant not found.' });
  }

  await insertSecurityAuditLog({
    userId: req.user?.id,
    action: 'family.occupant.delete',
    resource: 'occupant',
    resourceId: req.params.id,
    status: 'success',
    ipAddress: req.ip,
  });

  return res.status(204).send();
});

familiesRouter.get('/occupants/:id/ged-documents', async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const occupantCheck = await db.query('SELECT id FROM occupants WHERE id = $1', [req.params.id]);
  if (!occupantCheck.rowCount) {
    return res.status(404).json({ error: 'Occupant not found.' });
  }

  const result = await db.query(
    `SELECT gd.id,
            gd.process_id,
            gd.title,
            gd.category,
            gd.document_type,
            gd.file_name,
            gd.file_hash,
            gd.status,
            gd.current_version,
            gd.created_at,
            COALESCE(v.versions_count, 0) AS versions_count
     FROM ged_documents gd
     LEFT JOIN (
       SELECT document_id, COUNT(*)::int AS versions_count
       FROM ged_document_versions
       GROUP BY document_id
     ) v ON v.document_id = gd.id
     WHERE gd.metadata->>'occupant_id' = $1
     ORDER BY gd.created_at DESC`,
    [req.params.id]
  );

  return res.json({ items: result.rows });
});

familiesRouter.get('/occupants/:id/ged-documents/:gedDocumentId/versions', async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  const occupantId = String(req.params.id);
  const gedDocumentId = String(req.params.gedDocumentId);

  const gedCheck = await db.query(
    `SELECT id
     FROM ged_documents
     WHERE id = $1
       AND metadata->>'occupant_id' = $2`,
    [gedDocumentId, occupantId]
  );

  if (!gedCheck.rowCount) {
    return res.status(404).json({ error: 'GED document not found for occupant.' });
  }

  const versions = await db.query(
    `SELECT v.id,
            v.document_id,
            v.version_number,
            v.file_name,
            v.file_hash,
            v.created_at,
            COALESCE(v.file_url, CASE WHEN gd.current_version = v.version_number THEN gd.metadata->>'file_url' END) AS file_url
     FROM ged_document_versions v
     JOIN ged_documents gd ON gd.id = v.document_id
     WHERE v.document_id = $1
     ORDER BY version_number DESC`,
    [gedDocumentId]
  );

  return res.json({ items: versions.rows });
});

familiesRouter.post('/occupants/:id/documents/upload', upload.single('file'), async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  if (!req.file) {
    return res.status(400).json({ error: 'Missing file.' });
  }

  const parsed = occupantUploadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid upload payload.', details: parsed.error.flatten() });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const occupantCheck = await client.query(
      `SELECT o.id, o.name, o.property_id
       FROM occupants o
       WHERE o.id = $1`,
      [req.params.id]
    );
    if (!occupantCheck.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Occupant not found.' });
    }

    const occupant = occupantCheck.rows[0];
    const processLink = await client.query(
      `SELECT rpo.reurb_process_id
       FROM reurb_process_occupants rpo
       WHERE rpo.occupant_id = $1
       ORDER BY rpo.linked_at DESC
       LIMIT 1`,
      [req.params.id]
    );

    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const fileUrl = `/uploads/occupants/${req.file.filename}`;
    const insertResult = await client.query(
      `INSERT INTO occupant_documents (occupant_id, document_type, document_number, file_name, file_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, occupant_id, document_type, document_number, file_name, file_url, created_at`,
      [
        req.params.id,
        parsed.data.document_type,
        parsed.data.document_number ?? null,
        req.file.originalname,
        fileUrl,
      ]
    );

    const gedInsert = await client.query(
      `INSERT INTO ged_documents (
         process_id,
         title,
         category,
         document_type,
         file_name,
         file_hash,
         version,
         status,
         metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, 1, 'Pendente', $7::jsonb)
      RETURNING id, status, current_version`,
      [
        processLink.rows[0]?.reurb_process_id ?? null,
        `${parsed.data.document_type} - ${occupant.name}`,
        'Ocupação e Habitação Social',
        parsed.data.document_type,
        req.file.originalname,
        fileHash,
        JSON.stringify({
          source: 'families.upload',
          occupant_id: req.params.id,
          occupant_document_id: insertResult.rows[0].id,
          property_id: occupant.property_id,
          file_url: fileUrl,
          mime_type: req.file.mimetype,
          file_size_bytes: req.file.size,
        }),
      ]
    );

    await client.query(
      `INSERT INTO ged_document_versions (
         document_id,
         version_number,
         file_name,
         file_hash,
         uploaded_by,
         file_url
       )
       VALUES ($1, 1, $2, $3, $4, $5)`,
      [gedInsert.rows[0].id, req.file.originalname, fileHash, null, fileUrl]
    );

    await client.query('COMMIT');

    const responsePayload = {
      ...insertResult.rows[0],
      ged_document_id: gedInsert.rows[0].id,
      ged_status: gedInsert.rows[0].status,
      ged_current_version: gedInsert.rows[0].current_version,
    };

    await insertSecurityAuditLog({
      userId: req.user?.id,
      action: 'family.document.upload',
      resource: 'occupant_document',
      resourceId: String(insertResult.rows[0].id),
      status: 'success',
      ipAddress: req.ip,
      details: {
        occupantId: req.params.id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        gedDocumentId: gedInsert.rows[0].id,
      },
    });

    return res.status(201).json(responsePayload);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

familiesRouter.post('/occupants/:id/ged-documents/:gedDocumentId/version', upload.single('file'), async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ error: 'Database unavailable.' });

  if (!req.file) {
    return res.status(400).json({ error: 'Missing file.' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const occupantCheck = await client.query('SELECT id FROM occupants WHERE id = $1', [req.params.id]);
    if (!occupantCheck.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Occupant not found.' });
    }

    const gedCheck = await client.query(
      `SELECT id, status, current_version, metadata
       FROM ged_documents
       WHERE id = $1
         AND metadata->>'occupant_id' = $2
       FOR UPDATE`,
      [req.params.gedDocumentId, req.params.id]
    );

    if (!gedCheck.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'GED document not found for occupant.' });
    }

    const current = gedCheck.rows[0];
    const nextVersion = Number(current.current_version ?? 1) + 1;
    const fileUrl = `/uploads/occupants/${req.file.filename}`;
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const occupantDocumentId = current.metadata?.occupant_document_id ?? null;

    await client.query(
      `INSERT INTO ged_document_versions (
         document_id,
         version_number,
         file_name,
         file_hash,
         uploaded_by,
         file_url
       )
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.params.gedDocumentId, nextVersion, req.file.originalname, fileHash, null, fileUrl]
    );

    const gedUpdate = await client.query(
      `UPDATE ged_documents
       SET file_name = $2,
           file_hash = $3,
           version = $4,
           current_version = $4,
           updated_at = now(),
           metadata = jsonb_set(
             jsonb_set(
               jsonb_set(COALESCE(metadata, '{}'::jsonb), '{file_url}', to_jsonb($5::text), true),
               '{file_size_bytes}',
               to_jsonb($6::int),
               true
             ),
             '{mime_type}',
             to_jsonb($7::text),
             true
           )
       WHERE id = $1
       RETURNING id, status, current_version`,
      [req.params.gedDocumentId, req.file.originalname, fileHash, nextVersion, fileUrl, req.file.size, req.file.mimetype]
    );

    if (occupantDocumentId) {
      await client.query(
        `UPDATE occupant_documents
         SET file_name = $2,
             file_url = $3
         WHERE id = $1::uuid
           AND occupant_id = $4`,
        [occupantDocumentId, req.file.originalname, fileUrl, req.params.id]
      );
    }

    await client.query('COMMIT');

    await insertSecurityAuditLog({
      userId: req.user?.id,
      action: 'family.document.version.upload',
      resource: 'ged_document',
      resourceId: String(req.params.gedDocumentId),
      status: 'success',
      ipAddress: req.ip,
      details: {
        occupantId: req.params.id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        version: nextVersion,
      },
    });

    return res.status(201).json({
      ged_document_id: gedUpdate.rows[0].id,
      ged_status: gedUpdate.rows[0].status,
      ged_current_version: gedUpdate.rows[0].current_version,
      file_name: req.file.originalname,
      file_url: fileUrl,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});
