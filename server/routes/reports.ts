import express, { Response } from 'express';
import ExcelJS from 'exceljs';
import { query } from '../config/database.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { numberToArabic, formatCurrency } from '../utils/numberToArabic.js';

const router = express.Router();

// Get summary report
router.get('/summary', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    let whereClause = '';
    let params: any[] = [];

    // Filter by user role
    if (req.user?.role === 'user') {
      whereClause = 'WHERE user_id = ?';
      params.push(req.user.id);
    } else if (req.user?.role === 'manager' && req.user.department) {
      whereClause = 'WHERE department = ?';
      params.push(req.user.department);
    }

    // Get total requests by status
    const statusSql = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM Requests
      ${whereClause}
      GROUP BY status
    `;
    const statusStats: any = await query(statusSql, params);

    // Get total statistics
    const totalSql = `
      SELECT 
        COUNT(*) as total_requests,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as avg_amount,
        MAX(total_amount) as max_amount,
        MIN(total_amount) as min_amount
      FROM Requests
      ${whereClause}
    `;
    const totalStats: any = await query(totalSql, params);

    // Get requests by department
    const departmentSql = `
      SELECT 
        department,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM Requests
      ${whereClause}
      GROUP BY department
      ORDER BY total_amount DESC
      LIMIT 10
    `;
    const departmentStats: any = await query(departmentSql, params);

    // Get recent activity
    const recentSql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM Requests
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;
    const recentActivity: any = await query(recentSql, params);

    res.json({
      statusStats,
      totalStats: totalStats[0],
      departmentStats,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
});

// Get monthly report
router.get('/monthly', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = req.query.month as string;

    let whereConditions: string[] = [];
    let params: any[] = [];

    // Filter by user role
    if (req.user?.role === 'user') {
      whereConditions.push('user_id = ?');
      params.push(req.user.id);
    } else if (req.user?.role === 'manager' && req.user.department) {
      whereConditions.push('department = ?');
      params.push(req.user.department);
    }

    whereConditions.push('YEAR(request_date) = ?');
    params.push(year);

    if (month) {
      whereConditions.push('MONTH(request_date) = ?');
      params.push(parseInt(month));
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get monthly statistics
    const monthlySql = `
      SELECT 
        YEAR(request_date) as year,
        MONTH(request_date) as month,
        COUNT(*) as count,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as avg_amount
      FROM Requests
      ${whereClause}
      GROUP BY YEAR(request_date), MONTH(request_date)
      ORDER BY year, month
    `;
    const monthlyStats: any = await query(monthlySql, params);

    // Get status breakdown
    const statusSql = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM Requests
      ${whereClause}
      GROUP BY status
    `;
    const statusBreakdown: any = await query(statusSql, params);

    res.json({
      year,
      month: month ? parseInt(month) : null,
      monthlyStats,
      statusBreakdown,
    });
  } catch (error) {
    next(error);
  }
});

// Get report by department
router.get('/by-department', authenticate, authorize('admin', 'manager'), async (req: AuthRequest, res: Response, next) => {
  try {
    const department = req.query.department as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let whereConditions: string[] = [];
    let params: any[] = [];

    // Filter by department
    if (department) {
      whereConditions.push('department = ?');
      params.push(department);
    } else if (req.user?.role === 'manager' && req.user.department) {
      whereConditions.push('department = ?');
      params.push(req.user.department);
    }

    if (startDate) {
      whereConditions.push('request_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('request_date <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get department statistics
    const departmentSql = `
      SELECT 
        department,
        COUNT(*) as total_requests,
        SUM(total_amount) as total_amount,
        AVG(total_amount) as avg_amount,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM Requests
      ${whereClause}
      GROUP BY department
      ORDER BY total_amount DESC
    `;
    const departmentStats: any = await query(departmentSql, params);

    // Get top users by department
    const usersSql = `
      SELECT 
        r.department,
        u.full_name,
        u.username,
        COUNT(*) as request_count,
        SUM(r.total_amount) as total_amount
      FROM Requests r
      LEFT JOIN Users u ON r.user_id = u.id
      ${whereClause}
      GROUP BY r.department, u.id, u.full_name, u.username
      ORDER BY total_amount DESC
      LIMIT 20
    `;
    const topUsers: any = await query(usersSql, params);

    res.json({
      department: department || 'all',
      startDate,
      endDate,
      departmentStats,
      topUsers,
    });
  } catch (error) {
    next(error);
  }
});

// Export to Excel
router.get('/export/excel', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const status = req.query.status as string;
    const department = req.query.department as string;

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

    if (startDate) {
      whereConditions.push('r.request_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('r.request_date <= ?');
      params.push(endDate);
    }

    if (status) {
      whereConditions.push('r.status = ?');
      params.push(status);
    }

    if (department && req.user?.role === 'admin') {
      whereConditions.push('r.department = ?');
      params.push(department);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get requests
    const sql = `
      SELECT 
        r.request_number,
        r.department,
        r.beneficiary,
        r.request_date,
        r.description,
        r.total_amount,
        r.status,
        u.full_name as creator_name,
        a.full_name as approver_name,
        r.approved_at
      FROM Requests r
      LEFT JOIN Users u ON r.user_id = u.id
      LEFT JOIN Users a ON r.approved_by = a.id
      ${whereClause}
      ORDER BY r.request_date DESC
    `;

    const requests: any = await query(sql, params);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('طلبات الصرف');

    // Set RTL
    worksheet.views = [{ rightToLeft: true }];

    // Add headers
    worksheet.columns = [
      { header: 'رقم الطلب', key: 'request_number', width: 15 },
      { header: 'القسم', key: 'department', width: 20 },
      { header: 'المستفيد', key: 'beneficiary', width: 20 },
      { header: 'التاريخ', key: 'request_date', width: 15 },
      { header: 'المبلغ', key: 'total_amount', width: 15 },
      { header: 'الحالة', key: 'status', width: 12 },
      { header: 'منشئ الطلب', key: 'creator_name', width: 20 },
      { header: 'المعتمد', key: 'approver_name', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    requests.forEach((request: any) => {
      worksheet.addRow({
        request_number: request.request_number,
        department: request.department,
        beneficiary: request.beneficiary,
        request_date: request.request_date,
        total_amount: request.total_amount,
        status: request.status === 'pending' ? 'قيد الانتظار' : request.status === 'approved' ? 'موافق عليه' : request.status === 'rejected' ? 'مرفوض' : 'مكتمل',
        creator_name: request.creator_name,
        approver_name: request.approver_name || '-',
      });
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=requests_export.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});

// Export to CSV
router.get('/export/csv', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const status = req.query.status as string;
    const department = req.query.department as string;

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

    if (startDate) {
      whereConditions.push('r.request_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('r.request_date <= ?');
      params.push(endDate);
    }

    if (status) {
      whereConditions.push('r.status = ?');
      params.push(status);
    }

    if (department && req.user?.role === 'admin') {
      whereConditions.push('r.department = ?');
      params.push(department);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get requests
    const sql = `
      SELECT 
        r.request_number,
        r.department,
        r.beneficiary,
        r.request_date,
        r.description,
        r.total_amount,
        r.status,
        u.full_name as creator_name,
        a.full_name as approver_name
      FROM Requests r
      LEFT JOIN Users u ON r.user_id = u.id
      LEFT JOIN Users a ON r.approved_by = a.id
      ${whereClause}
      ORDER BY r.request_date DESC
    `;

    const requests: any = await query(sql, params);

    // Create CSV content
    const headers = 'رقم الطلب,القسم,المستفيد,التاريخ,المبلغ,الحالة,منشئ الطلب,المعتمد\n';
    const rows = requests.map((request: any) => {
      const statusText = request.status === 'pending' ? 'قيد الانتظار' : request.status === 'approved' ? 'موافق عليه' : request.status === 'rejected' ? 'مرفوض' : 'مكتمل';
      return `"${request.request_number}","${request.department}","${request.beneficiary}","${request.request_date}","${request.total_amount}","${statusText}","${request.creator_name}","${request.approver_name || '-'}"`;
    }).join('\n');

    const csv = '\uFEFF' + headers + rows; // Add BOM for UTF-8

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=requests_export.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;
