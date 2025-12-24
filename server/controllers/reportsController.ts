import { Request, Response } from 'express';
import { query } from '../database/connection.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { numberToArabicWords } from '../utils/numberToArabic.js';

/**
 * Get summary report (current month)
 */
export async function getSummary(req: Request, res: Response) {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const sql = `
      SELECT
        COUNT(*) as totalRequests,
        SUM(amountInNumbers) as totalAmount,
        SUM(CASE WHEN status = 'تم التنفيذ' THEN 1 ELSE 0 END) as completedRequests,
        SUM(CASE WHEN status = 'في انتظار' THEN 1 ELSE 0 END) as pendingRequests,
        SUM(CASE WHEN status = 'موافق' THEN 1 ELSE 0 END) as approvedRequests
      FROM requests
      WHERE createdAt BETWEEN ? AND ?
    `;

    const results = await query<any[]>(sql, [firstDayOfMonth, lastDayOfMonth]);

    res.json({ data: results[0] });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
}

/**
 * Get monthly statistics
 */
export async function getMonthly(req: Request, res: Response) {
  try {
    const { year, month } = req.query;

    const targetYear = parseInt(year as string) || new Date().getFullYear();
    const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;

    const sql = `
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count,
        SUM(amountInNumbers) as totalAmount,
        status
      FROM requests
      WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?
      GROUP BY DATE(createdAt), status
      ORDER BY date
    `;

    const results = await query<any[]>(sql, [targetYear, targetMonth]);

    res.json({ data: results });
  } catch (error) {
    console.error('Get monthly error:', error);
    res.status(500).json({ error: 'Failed to get monthly statistics' });
  }
}

/**
 * Get statistics by department
 */
export async function getByDepartment(req: Request, res: Response) {
  try {
    const sql = `
      SELECT
        department,
        COUNT(*) as requestCount,
        SUM(amountInNumbers) as totalAmount,
        AVG(amountInNumbers) as avgAmount
      FROM requests
      GROUP BY department
      ORDER BY totalAmount DESC
    `;

    const results = await query<any[]>(sql);

    res.json({ data: results });
  } catch (error) {
    console.error('Get by department error:', error);
    res.status(500).json({ error: 'Failed to get department statistics' });
  }
}

/**
 * Export requests to Excel
 */
export async function exportExcel(req: Request, res: Response) {
  try {
    const { startDate, endDate, department, status } = req.query;

    let sql = 'SELECT * FROM requests WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      sql += ' AND createdAt >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND createdAt <= ?';
      params.push(endDate);
    }

    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY createdAt DESC';

    const requests = await query<any[]>(sql, params);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('طلبات الصرف');

    // Set right-to-left
    worksheet.views = [{ rightToLeft: true }];

    // Add headers
    worksheet.columns = [
      { header: 'رقم الطلب', key: 'requestNumber', width: 20 },
      { header: 'نوع الدفع', key: 'paymentType', width: 20 },
      { header: 'اسم مقدم الطلب', key: 'requesterName', width: 25 },
      { header: 'القسم', key: 'department', width: 20 },
      { header: 'المبلغ (رقماً)', key: 'amountInNumbers', width: 15 },
      { header: 'المبلغ (كتابة)', key: 'amountInWords', width: 40 },
      { header: 'الحالة', key: 'status', width: 15 },
      { header: 'تاريخ الإنشاء', key: 'createdAt', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1e3a5f' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data
    requests.forEach((request) => {
      worksheet.addRow({
        requestNumber: request.requestNumber,
        paymentType: request.paymentType,
        requesterName: request.requesterName,
        department: request.department,
        amountInNumbers: request.amountInNumbers,
        amountInWords: request.amountInWords,
        status: request.status,
        createdAt: new Date(request.createdAt).toLocaleDateString('ar-SA'),
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=requests.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
}

/**
 * Export requests to PDF
 */
export async function exportPDF(req: Request, res: Response) {
  try {
    const { startDate, endDate, department, status } = req.query;

    let sql = 'SELECT * FROM requests WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      sql += ' AND createdAt >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND createdAt <= ?';
      params.push(endDate);
    }

    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY createdAt DESC';

    const requests = await query<any[]>(sql, params);

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=requests.pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('تقرير طلبات الصرف', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`عدد الطلبات: ${requests.length}`, { align: 'center' });
    doc.moveDown(2);

    // Add requests
    requests.forEach((request, index) => {
      doc
        .fontSize(14)
        .text(`${index + 1}. ${request.requestNumber}`, { underline: true });
      doc.fontSize(10);
      doc.text(`مقدم الطلب: ${request.requesterName}`);
      doc.text(`القسم: ${request.department}`);
      doc.text(`المبلغ: ${request.amountInNumbers} ريال`);
      doc.text(`الحالة: ${request.status}`);
      doc.text(`التاريخ: ${new Date(request.createdAt).toLocaleDateString('ar-SA')}`);
      doc.moveDown();

      // Add page break every 8 requests
      if ((index + 1) % 8 === 0 && index < requests.length - 1) {
        doc.addPage();
      }
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
}

/**
 * Export requests to CSV
 */
export async function exportCSV(req: Request, res: Response) {
  try {
    const { startDate, endDate, department, status } = req.query;

    let sql = 'SELECT * FROM requests WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      sql += ' AND createdAt >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND createdAt <= ?';
      params.push(endDate);
    }

    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY createdAt DESC';

    const requests = await query<any[]>(sql, params);

    // Create CSV header
    const headers = [
      'رقم الطلب',
      'نوع الدفع',
      'اسم مقدم الطلب',
      'القسم',
      'المبلغ',
      'الحالة',
      'التاريخ',
    ];

    let csv = headers.join(',') + '\n';

    // Add data
    requests.forEach((request) => {
      const row = [
        request.requestNumber,
        request.paymentType,
        request.requesterName,
        request.department,
        request.amountInNumbers,
        request.status,
        new Date(request.createdAt).toLocaleDateString('ar-SA'),
      ];
      csv += row.map((field) => `"${field}"`).join(',') + '\n';
    });

    // Set response headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=requests.csv');

    // Add BOM for UTF-8
    res.write('\ufeff');
    res.write(csv);
    res.end();
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
}
