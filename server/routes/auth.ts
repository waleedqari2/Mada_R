import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { query } from '../config/database.js';
import { authenticate, generateToken, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLog.js';

const router = express.Router();

// Register new user
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('اسم المستخدم يجب أن يكون بين 3 و 50 حرف'),
    body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    body('full_name').trim().isLength({ min: 2, max: 100 }).withMessage('الاسم الكامل مطلوب'),
    body('department').optional().trim(),
    body('phone').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, email, password, full_name, department, phone } = req.body;

      // Check if user already exists
      const existingUser: any = await query(
        'SELECT id FROM Users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUser.length > 0) {
        res.status(400).json({ error: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result: any = await query(
        `INSERT INTO Users (username, email, password, full_name, department, phone)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, full_name, department || null, phone || null]
      );

      const userId = result.insertId;

      // Create audit log
      await logAction(
        { user: { id: userId, username, email, role: 'user', department: department || '' } } as AuthRequest,
        'REGISTER',
        'User',
        userId,
        null,
        { username, email, full_name }
      );

      res.status(201).json({
        message: 'تم إنشاء الحساب بنجاح',
        user: {
          id: userId,
          username,
          email,
          full_name,
          department,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('اسم المستخدم مطلوب'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Get user
      const users: any = await query(
        'SELECT * FROM Users WHERE (username = ? OR email = ?) AND is_active = TRUE',
        [username, username]
      );

      if (users.length === 0) {
        res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        return;
      }

      const user = users[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        return;
      }

      // Update last login
      await query('UPDATE Users SET last_login = NOW() WHERE id = ?', [user.id]);

      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
      });

      // Create audit log
      await logAction(
        { user: { id: user.id, username: user.username, email: user.email, role: user.role, department: user.department } } as AuthRequest,
        'LOGIN',
        'User',
        user.id
      );

      res.json({
        message: 'تم تسجيل الدخول بنجاح',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          department: user.department,
          phone: user.phone,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    const users: any = await query(
      'SELECT id, username, email, full_name, role, department, phone, created_at, last_login FROM Users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    res.json({ user: users[0] });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put(
  '/profile',
  authenticate,
  [
    body('full_name').optional().trim().isLength({ min: 2, max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('department').optional().trim(),
    body('phone').optional().trim(),
  ],
  validate,
  async (req: AuthRequest, res: Response, next) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'غير مصرح' });
        return;
      }

      const { full_name, email, department, phone } = req.body;
      const updates: string[] = [];
      const params: any[] = [];

      if (full_name) {
        updates.push('full_name = ?');
        params.push(full_name);
      }
      if (email) {
        updates.push('email = ?');
        params.push(email);
      }
      if (department) {
        updates.push('department = ?');
        params.push(department);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        params.push(phone);
      }

      if (updates.length === 0) {
        res.status(400).json({ error: 'لا توجد بيانات للتحديث' });
        return;
      }

      params.push(req.user.id);

      await query(
        `UPDATE Users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      // Create audit log
      await logAction(req, 'UPDATE', 'User', req.user.id, null, { full_name, email, department, phone });

      res.json({ message: 'تم تحديث الملف الشخصي بنجاح' });
    } catch (error) {
      next(error);
    }
  }
);

// Logout (client-side only, but useful for audit log)
router.post('/logout', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    if (req.user) {
      await logAction(req, 'LOGOUT', 'User', req.user.id);
    }
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    next(error);
  }
});

export default router;
