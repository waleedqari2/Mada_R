import express, { Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Search requests
router.get('/search', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const searchQuery = req.query.query as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    if (!searchQuery || searchQuery.trim().length === 0) {
      res.status(400).json({ error: 'نص البحث مطلوب' });
      return;
    }

    const searchTerm = `%${searchQuery}%`;
    let whereConditions: string[] = [];
    let params: any[] = [];

    // Search in request fields
    whereConditions.push(`(
      r.request_number LIKE ? OR
      r.beneficiary LIKE ? OR
      r.description LIKE ? OR
      r.notes LIKE ? OR
      r.department LIKE ?
    )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

    // Filter by user role
    if (req.user?.role === 'user') {
      whereConditions.push('r.user_id = ?');
      params.push(req.user.id);
    } else if (req.user?.role === 'manager' && req.user.department) {
      whereConditions.push('r.department = ?');
      params.push(req.user.department);
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
      searchQuery,
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

// Filter requests with advanced criteria
router.get('/filter', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const status = req.query.status as string;
    const department = req.query.department as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const minAmount = req.query.minAmount as string;
    const maxAmount = req.query.maxAmount as string;
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

    // Apply filters
    if (status) {
      whereConditions.push('r.status = ?');
      params.push(status);
    }

    if (department && (req.user?.role === 'admin' || req.user?.role === 'manager')) {
      whereConditions.push('r.department = ?');
      params.push(department);
    }

    if (startDate) {
      whereConditions.push('r.request_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('r.request_date <= ?');
      params.push(endDate);
    }

    if (minAmount) {
      whereConditions.push('r.total_amount >= ?');
      params.push(parseFloat(minAmount));
    }

    if (maxAmount) {
      whereConditions.push('r.total_amount <= ?');
      params.push(parseFloat(maxAmount));
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
      filters: {
        status,
        department,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        userId,
      },
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

export default router;
