import express, { Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    let whereClause = 'WHERE user_id = ?';
    const params = [req.user.id];

    if (unreadOnly) {
      whereClause += ' AND is_read = FALSE';
    }

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM Notifications ${whereClause}`;
    const countResult: any = await query(countSql, params);
    const total = countResult[0]?.total || 0;

    // Get notifications
    const sql = `
      SELECT * FROM Notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const notifications: any = await query(sql, [...params, limit, offset]);

    // Get unread count
    const unreadSql = `SELECT COUNT(*) as unread FROM Notifications WHERE user_id = ? AND is_read = FALSE`;
    const unreadResult: any = await query(unreadSql, [req.user.id]);
    const unreadCount = unreadResult[0]?.unread || 0;

    res.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    const { id } = req.params;

    await query(
      'UPDATE Notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'تم تحديث الإشعار' });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    await query(
      'UPDATE Notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({ message: 'تم تحديث جميع الإشعارات' });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    const { id } = req.params;

    await query('DELETE FROM Notifications WHERE id = ? AND user_id = ?', [id, req.user.id]);

    res.json({ message: 'تم حذف الإشعار' });
  } catch (error) {
    next(error);
  }
});

export default router;
