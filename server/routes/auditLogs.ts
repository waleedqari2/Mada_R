import { Router } from 'express';
import { query } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { Request, Response } from 'express';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get audit logs with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query<any[]>('SELECT COUNT(*) as total FROM audit_logs');
    const total = countResult[0].total;

    // Get audit logs
    const sql = `
      SELECT al.*, u.username, r.requestNumber
      FROM audit_logs al
      LEFT JOIN users u ON al.userId = u.id
      LEFT JOIN requests r ON al.requestId = r.id
      ORDER BY al.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await query<any[]>(sql, [limit, offset]);

    res.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

export default router;
