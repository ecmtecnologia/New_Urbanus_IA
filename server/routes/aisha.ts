import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth';
import { insertAishaAuditLog, insertSecurityAuditLog } from '../db';
import { analyzeWithAisha } from '../services/aishaService';

const analyzeSchema = z.object({
  processData: z.unknown(),
  modelType: z.enum(['fast', 'deep']).default('fast'),
});

export const aishaRouter = Router();

aishaRouter.use(requireAuth);

aishaRouter.post('/analyze', async (req, res) => {
  const parsed = analyzeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid request payload.',
      details: parsed.error.flatten(),
    });
  }

  const { processData, modelType } = parsed.data;
  const requestIp = req.ip;

  try {
    const result = await analyzeWithAisha(processData, modelType);

    await insertAishaAuditLog({
      modelType,
      requestPayload: processData,
      responsePayload: result,
      status: 'success',
      processId: (processData as any)?.id,
    });

    await insertSecurityAuditLog({
      userId: req.user?.id,
      action: 'aisha.analyze',
      resource: 'aisha',
      resourceId: String((processData as any)?.id ?? ''),
      status: 'success',
      ipAddress: requestIp,
      details: { modelType },
    });

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown AISHA error';

    await insertAishaAuditLog({
      modelType,
      requestPayload: processData,
      status: 'error',
      errorMessage: message,
      processId: (processData as any)?.id,
    });

    await insertSecurityAuditLog({
      userId: req.user?.id,
      action: 'aisha.analyze',
      resource: 'aisha',
      resourceId: String((processData as any)?.id ?? ''),
      status: 'failed',
      ipAddress: requestIp,
      details: { modelType, error: message },
    });

    return res.status(502).json({
      error: 'AISHA request failed.',
      message,
    });
  }
});
