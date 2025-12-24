import { Router, Request, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../database/connection.js';
import { numberToArabicWords } from '../utils/numberToWords.js';

const router = Router();

// Type definitions
interface RequestData {
  id?: number;
  requestNumber: string;
  paymentType: 'نقدي' | 'شيك' | 'تحويل';
  requesterName: string;
  jobTitle: string;
  department: 'الإدارة' | 'الحسابات' | 'المبيعات' | 'التسويق' | 'الحجوزات' | 'العمليات';
  approverDepartment: 'الإدارة' | 'الحسابات' | 'المبيعات' | 'التسويق' | 'الحجوزات' | 'العمليات';
  amountInNumbers: number;
  amountInWords?: string;
  status?: 'تم التعميد' | 'في انتظار التعميد' | 'موافق عليها' | 'تم التنفيذ';
  createdAt?: Date;
  updatedAt?: Date;
}

// Generate a unique request number
async function generateRequestNumber(): Promise<string> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT COALESCE(MAX(id), 0) as maxId FROM requests'
  );
  const nextNum = rows[0].maxId + 1;
  const year = new Date().getFullYear();
  return `REQ-${year}-${String(nextNum).padStart(5, '0')}`;
}

// POST /api/requests - Create new request
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      paymentType,
      requesterName,
      jobTitle,
      department,
      approverDepartment,
      amountInNumbers,
    } = req.body;

    // Validate required fields
    if (!paymentType || !requesterName || !jobTitle || !department || !approverDepartment || amountInNumbers === undefined) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    // Generate request number and convert amount to words
    const requestNumber = await generateRequestNumber();
    const amountInWords = numberToArabicWords(Number(amountInNumbers));
    const defaultStatus = 'في انتظار التعميد';

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO requests 
      (requestNumber, paymentType, requesterName, jobTitle, department, approverDepartment, amountInNumbers, amountInWords, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [requestNumber, paymentType, requesterName, jobTitle, department, approverDepartment, amountInNumbers, amountInWords, defaultStatus]
    );

    // Fetch the created request
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM requests WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'حدث خطأ في إنشاء الطلب' });
  }
});

// GET /api/requests - Get all requests
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM requests ORDER BY createdAt DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب الطلبات' });
  }
});

// GET /api/requests/:id - Get specific request
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM requests WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب الطلب' });
  }
});

// PUT /api/requests/:id - Update request
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      paymentType,
      requesterName,
      jobTitle,
      department,
      approverDepartment,
      amountInNumbers,
      status,
    } = req.body;

    // Check if request exists
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM requests WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    // Convert amount to words if amount was updated
    const amountInWords = amountInNumbers !== undefined 
      ? numberToArabicWords(Number(amountInNumbers))
      : undefined;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (paymentType !== undefined) {
      updates.push('paymentType = ?');
      values.push(paymentType);
    }
    if (requesterName !== undefined) {
      updates.push('requesterName = ?');
      values.push(requesterName);
    }
    if (jobTitle !== undefined) {
      updates.push('jobTitle = ?');
      values.push(jobTitle);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      values.push(department);
    }
    if (approverDepartment !== undefined) {
      updates.push('approverDepartment = ?');
      values.push(approverDepartment);
    }
    if (amountInNumbers !== undefined) {
      updates.push('amountInNumbers = ?');
      values.push(amountInNumbers);
      updates.push('amountInWords = ?');
      values.push(amountInWords);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'لا توجد بيانات للتحديث' });
    }

    values.push(id);

    await pool.query(
      `UPDATE requests SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated request
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM requests WHERE id = ?',
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'حدث خطأ في تحديث الطلب' });
  }
});

// DELETE /api/requests/:id - Delete request
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM requests WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    res.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'حدث خطأ في حذف الطلب' });
  }
});

export default router;
