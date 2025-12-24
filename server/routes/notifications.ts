import { Router } from 'express';
import { query } from '../database/connection.js';
import { authenticate } from '../middleware/auth.js';
import { Request, Response } from 'express';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get user notifications
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT n.*, r.requestNumber
      FROM notifications n
      LEFT JOIN requests r ON n.requestId = r.id
      WHERE n.userId = ?
      ORDER BY n.createdAt DESC
      LIMIT 50
    `;

    const notifications = await query<any[]>(sql, [req.user!.userId]);

    res.json({ data: notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

/**
 * Mark notification as read
 */
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await query('UPDATE notifications SET isRead = TRUE WHERE id = ? AND userId = ?', [
      id,
      req.user!.userId,
    ]);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * Mark all notifications as read
 */
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    await query('UPDATE notifications SET isRead = TRUE WHERE userId = ?', [req.user!.userId]);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * Create a notification (helper function)
 */
export async function createNotification(
  userId: number,
  message: string,
  type: 'approval' | 'delay' | 'status_change' | 'general',
  requestId?: number
): Promise<void> {
  try {
    const sql = `
      INSERT INTO notifications (userId, message, type, requestId)
      VALUES (?, ?, ?, ?)
    `;

    await query(sql, [userId, message, type, requestId || null]);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export default router;
