import { Router } from 'express';
import { z } from 'zod';
import { comparePassword, hashPassword, requireAuth, signAccessToken, type UserRole } from '../auth';
import { getDbPool, insertSecurityAuditLog } from '../db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['MASTER', 'ADMIN', 'JURIDICO', 'SOCIAL', 'TECNICO']).optional(),
});

const roleSet = new Set<UserRole>(['MASTER', 'ADMIN', 'JURIDICO', 'SOCIAL', 'TECNICO']);

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid login payload.',
      details: parsed.error.flatten(),
    });
  }

  const db = getDbPool();
  if (!db) {
    return res.status(503).json({ error: 'Database unavailable.' });
  }

  const { email, password, role } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const requestIp = req.ip;

  const existing = await db.query(
    'SELECT id, name, email, role, password_hash FROM app_users WHERE email = $1 LIMIT 1',
    [normalizedEmail],
  );

  let user = existing.rows[0] as
    | { id: string; name: string; email: string; role: UserRole; password_hash: string | null }
    | undefined;

  if (!user) {
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must contain at least 8 characters for new accounts.',
      });
    }

    const finalRole: UserRole = role && roleSet.has(role) ? role : 'ADMIN';
    const generatedName = normalizedEmail.split('@')[0].toUpperCase();
    const passwordHash = await hashPassword(password);

    const created = await db.query(
      `
      INSERT INTO app_users (name, email, role, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, password_hash
      `,
      [generatedName, normalizedEmail, finalRole, passwordHash],
    );

    user = created.rows[0];
  }

  let resolvedUser = user;

  if (!resolvedUser) {
    return res.status(500).json({ error: 'Failed to resolve user account.' });
  }

  if (!resolvedUser.password_hash) {
    const newHash = await hashPassword(password);
    const updated = await db.query(
      'UPDATE app_users SET password_hash = $2 WHERE id = $1 RETURNING id, name, email, role, password_hash',
      [resolvedUser.id, newHash],
    );
    resolvedUser = updated.rows[0];
  }

  if (!resolvedUser || !resolvedUser.password_hash) {
    return res.status(500).json({ error: 'Failed to initialize user credentials.' });
  }

  const ok = await comparePassword(password, resolvedUser.password_hash);
  if (!ok) {
    await insertSecurityAuditLog({
      userId: resolvedUser.id,
      action: 'auth.login',
      resource: 'session',
      status: 'failed',
      ipAddress: requestIp,
      details: { reason: 'invalid_credentials', email: normalizedEmail },
    });

    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = signAccessToken({
    id: resolvedUser.id,
    name: resolvedUser.name,
    email: resolvedUser.email,
    role: resolvedUser.role,
  });

  await insertSecurityAuditLog({
    userId: resolvedUser.id,
    action: 'auth.login',
    resource: 'session',
    status: 'success',
    ipAddress: requestIp,
    details: { email: normalizedEmail, role: resolvedUser.role },
  });

  return res.json({
    token,
    user: {
      id: resolvedUser.id,
      name: resolvedUser.name,
      email: resolvedUser.email,
      role: resolvedUser.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedUser.name)}&background=0D9488&color=fff`,
    },
  });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});
