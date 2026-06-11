import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { aishaRouter } from './routes/aisha';
import { authRouter } from './routes/auth';
import { familiesRouter } from './routes/families';
import { processRouter } from './routes/processes';
import { territoryRouter } from './routes/territory';
import { checkDbHealth } from './db';
import { env } from './env';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  return res.json({ ok: true, service: 'urbanus-api' });
});

app.get('/api/health/db', async (_req, res) => {
  const ok = await checkDbHealth();
  return res.status(ok ? 200 : 503).json({ ok });
});

app.use('/api/auth', authRouter);
app.use('/api/processes', processRouter);
app.use('/api/aisha', aishaRouter);
app.use('/api/territory', territoryRouter);
app.use('/api/families', familiesRouter);

app.listen(env.PORT, () => {
  console.log(`Urbanus API running at http://localhost:${env.PORT}`);
});
