import express, { Response } from 'express';
import { body, query as queryValidator } from 'express-validator';
import { query, transaction } from '../config/database.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLog.js';

const router = express.Router();

// Get all requests with pagination and filters
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const status = req.query.status as string;
    const department = req.query.department as string;
    const userId = req.query.userId as string;

    let whereConditions: string[] = [];
    let params: any[] = [];

    // Filter by user role
    if (req.user?.role === 'user') {
      whereConditions.push('r.user_id = ?');
      params.push(req.user.id);
    } else if (req.user?.role === 'manager' && req.user.department) {
      whereConditions.push('r.department = ?');
      params.push(req.user.department);
    }

    if (status) {
      whereConditions.push('r.status = ?');
      params.push(status);
    }

    if (department && req.user?.role === 'admin') {
      whereConditions.push('r.department = ?');
      params.push(department);
    }

    if (userId && (req.user?.role === 'admin' || req.user?.role === 'manager')) {
      whereConditions.push('r.user_id = ?');
      params.push(userId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM Requests r ${whereClause}`;
    const countResult: any = await query(countSql, params);
    const total = countResult[0]?.total || 0;

    // Get requests
    const sql = `
      SELECT 
        r.*,
        u.username as creator_username,
        u.full_name as creator_name,
        a.username as approver_username,
        a.full_name as approver_name
      FROM Requests r
      LEFT JOIN Users u ON r.user_id = u.id
      LEFT JOIN Users a ON r.approved_by = a.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const requests: any = await query(sql, [...params, limit, offset]);

    res.json({
      requests,
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

// Get single request by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        r.*,
        u.username as creator_username,
        u.full_name as creator_name,
        a.username as approver_username,
        a.full_name as approver_name
      FROM Requests r
      LEFT JOIN Users u ON r.user_id = u.id
      LEFT JOIN Users a ON r.approved_by = a.id
      WHERE r.id = ?
    `;

    const requests: any = await query(sql, [id]);

    if (requests.length === 0) {
      res.status(404).json({ error: 'الطلب غير موجود' });
      return;
    }

    const request = requests[0];

    // Check permissions
    if (
      req.user?.role === 'user' &&
      request.user_id !== req.user.id
    ) {
      res.status(403).json({ error: 'ليس لديك صلاحية لعرض هذا الطلب' });
      return;
    }

    if (
      req.user?.role === 'manager' &&
      request.department !== req.user.department
    ) {
      res.status(403).json({ error: 'ليس لديك صلاحية لعرض هذا الطلب' });
      return;
    }

    // Get request items
    const itemsSql = `
      SELECT * FROM RequestItems
      WHERE request_id = ?
      ORDER BY item_number
    `;
    const items: any = await query(itemsSql, [id]);

    res.json({
      request,
      items,
    });
  } catch (error) {
    next(error);
  }
});

// Create new request
router.post(
  '/',
  authenticate,
  [
    body('request_number').trim().notEmpty().withMessage('رقم الطلب مطلوب'),
    body('department').trim().notEmpty().withMessage('القسم مطلوب'),
    body('beneficiary').trim().notEmpty().withMessage('المستفيد مطلوب'),
    body('request_date').isDate().withMessage('تاريخ الطلب غير صحيح'),
    body('description').optional().trim(),
    body('items').isArray({ min: 1 }).withMessage('يجب إضافة عنصر واحد على الأقل'),
    body('items.*.description').trim().notEmpty().withMessage('وصف العنصر مطلوب'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('الكمية يجب أن تكون رقم صحيح موجب'),
    body('items.*.unit_price').isFloat({ min: 0 }).withMessage('السعر يجب أن تكون رقم موجب'),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: any) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'غير مصرح' });
        return;
      }

      const { request_number, department, beneficiary, request_date, description, items, notes } = req.body;

      // Calculate total amount
      const totalAmount = items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);

      // Use transaction
      const result = await transaction(async (connection) => {
        // Insert request
        const [requestResult]: any = await connection.execute(
          `INSERT INTO Requests (request_number, user_id, department, beneficiary, request_date, description, total_amount, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [request_number, req.user!.id, department, beneficiary, request_date, description || null, totalAmount, notes || null]
        );

        const requestId = requestResult.insertId;

        // Insert items
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const totalPrice = item.quantity * item.unit_price;

          await connection.execute(
            `INSERT INTO RequestItems (request_id, item_number, description, quantity, unit_price, total_price, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [requestId, i + 1, item.description, item.quantity, item.unit_price, totalPrice, item.notes || null]
          );
        }

        return { requestId, totalAmount };
      });

      // Create audit log
      await logAction(req, 'CREATE', 'Request', result.requestId, null, { request_number, department, totalAmount: result.totalAmount });

      res.status(201).json({
        message: 'تم إنشاء الطلب بنجاح',
        requestId: result.requestId,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update request
router.put(
  '/:id',
  authenticate,
  [
    body('department').optional().trim(),
    body('beneficiary').optional().trim(),
    body('request_date').optional().isDate(),
    body('description').optional().trim(),
    body('notes').optional().trim(),
    body('items').optional().isArray(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: any) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'غير مصرح' });
        return;
      }

      const { id } = req.params;

      // Check if request exists and get current data
      const existingRequests: any = await query('SELECT * FROM Requests WHERE id = ?', [id]);
      if (existingRequests.length === 0) {
        res.status(404).json({ error: 'الطلب غير موجود' });
        return;
      }

      const existingRequest = existingRequests[0];

      // Check permissions
      if (req.user.role === 'user' && existingRequest.user_id !== req.user.id) {
        res.status(403).json({ error: 'ليس لديك صلاحية لتعديل هذا الطلب' });
        return;
      }

      // Check if request can be edited (only pending requests)
      if (existingRequest.status !== 'pending') {
        res.status(400).json({ error: 'لا يمكن تعديل طلب تم معالجته' });
        return;
      }

      const { department, beneficiary, request_date, description, notes, items } = req.body;

      await transaction(async (connection) => {
        // Update request
        const updates: string[] = [];
        const params: any[] = [];

        if (department) {
          updates.push('department = ?');
          params.push(department);
        }
        if (beneficiary) {
          updates.push('beneficiary = ?');
          params.push(beneficiary);
        }
        if (request_date) {
          updates.push('request_date = ?');
          params.push(request_date);
        }
        if (description !== undefined) {
          updates.push('description = ?');
          params.push(description);
        }
        if (notes !== undefined) {
          updates.push('notes = ?');
          params.push(notes);
        }

        if (items && items.length > 0) {
          // Calculate new total
          const totalAmount = items.reduce((sum: number, item: any) => {
            return sum + (item.quantity * item.unit_price);
          }, 0);

          updates.push('total_amount = ?');
          params.push(totalAmount);

          // Delete old items
          await connection.execute('DELETE FROM RequestItems WHERE request_id = ?', [id]);

          // Insert new items
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const totalPrice = item.quantity * item.unit_price;

            await connection.execute(
              `INSERT INTO RequestItems (request_id, item_number, description, quantity, unit_price, total_price, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [id, i + 1, item.description, item.quantity, item.unit_price, totalPrice, item.notes || null]
            );
          }
        }

        if (updates.length > 0) {
          params.push(id);
          await connection.execute(
            `UPDATE Requests SET ${updates.join(', ')} WHERE id = ?`,
            params
          );
        }
      });

      // Create audit log
      await logAction(req, 'UPDATE', 'Request', parseInt(id), existingRequest, req.body);

      res.json({ message: 'تم تحديث الطلب بنجاح' });
    } catch (error) {
      next(error);
    }
  }
);

// Delete request
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response, next: any) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    const { id } = req.params;

    // Check if request exists
    const existingRequests: any = await query('SELECT * FROM Requests WHERE id = ?', [id]);
    if (existingRequests.length === 0) {
      res.status(404).json({ error: 'الطلب غير موجود' });
      return;
    }

    const existingRequest = existingRequests[0];

    // Check permissions
    if (req.user.role === 'user' && existingRequest.user_id !== req.user.id) {
      res.status(403).json({ error: 'ليس لديك صلاحية لحذف هذا الطلب' });
      return;
    }

    // Check if request can be deleted (only pending requests)
    if (existingRequest.status !== 'pending' && req.user.role !== 'admin') {
      res.status(400).json({ error: 'لا يمكن حذف طلب تم معالجته' });
      return;
    }

    await query('DELETE FROM Requests WHERE id = ?', [id]);

    // Create audit log
    await logAction(req, 'DELETE', 'Request', parseInt(id), existingRequest, null);

    res.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    next(error);
  }
});

// Approve/Reject request
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('status').isIn(['approved', 'rejected', 'completed']).withMessage('الحالة غير صحيحة'),
    body('notes').optional().trim(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next: any) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'غير مصرح' });
        return;
      }

      const { id } = req.params;
      const { status, notes } = req.body;

      // Check if request exists
      const existingRequests: any = await query('SELECT * FROM Requests WHERE id = ?', [id]);
      if (existingRequests.length === 0) {
        res.status(404).json({ error: 'الطلب غير موجود' });
        return;
      }

      const existingRequest = existingRequests[0];

      // Check department permission for managers
      if (req.user.role === 'manager' && existingRequest.department !== req.user.department) {
        res.status(403).json({ error: 'ليس لديك صلاحية لتغيير حالة هذا الطلب' });
        return;
      }

      // Update status
      await query(
        `UPDATE Requests SET status = ?, approved_by = ?, approved_at = NOW(), notes = ? WHERE id = ?`,
        [status, req.user.id, notes || null, id]
      );

      // Create audit log
      await logAction(req, 'STATUS_CHANGE', 'Request', parseInt(id), { status: existingRequest.status }, { status, notes });

      // Create notification for request creator
      await query(
        `INSERT INTO Notifications (user_id, title, message, type, related_entity_type, related_entity_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          existingRequest.user_id,
          status === 'approved' ? 'تم الموافقة على الطلب' : status === 'rejected' ? 'تم رفض الطلب' : 'تم إكمال الطلب',
          `تم ${status === 'approved' ? 'الموافقة على' : status === 'rejected' ? 'رفض' : 'إكمال'} الطلب رقم ${existingRequest.request_number}`,
          status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
          'Request',
          id
        ]
      );

      res.json({ message: 'تم تحديث حالة الطلب بنجاح' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
