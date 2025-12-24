import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface UserPayload {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

// Generate JWT token
export function generateToken(payload: UserPayload): string {
  const expiresIn = process.env.JWT_EXPIRY || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

// Verify JWT token
export function verifyToken(token: string): UserPayload {
  return jwt.verify(token, JWT_SECRET) as UserPayload;
}

// Auth middleware
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'لا يوجد رمز مصادقة' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'رمز المصادقة غير صالح' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'انتهت صلاحية رمز المصادقة' });
    } else {
      res.status(500).json({ error: 'خطأ في المصادقة' });
    }
  }
}

// Role-based authorization middleware
export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'ليس لديك صلاحية للوصول' });
      return;
    }

    next();
  };
}

export default { authenticate, authorize, generateToken, verifyToken };
