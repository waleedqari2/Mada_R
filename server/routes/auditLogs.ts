import express, { Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { getAuditLogs } from '../utils/auditLog.js';

const router = express.Router();

// Get audit logs
router.get('/', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.query.userId as string;
    const entityType = req.query.entityType as string;
    const action = req.query.action as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const filters: any = {};

    if (userId) filters.userId = parseInt(userId);
    if (entityType) filters.entityType = entityType;
    if (action) filters.action = action;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await getAuditLogs(page, limit, filters);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
