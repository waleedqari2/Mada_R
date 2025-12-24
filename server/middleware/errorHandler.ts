import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

// Error handler middleware
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'حدث خطأ في الخادم';

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    message = 'القيمة موجودة مسبقاً';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'مرجع غير صحيح';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Validation middleware
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: ValidationError) => {
      if ('msg' in error) {
        return error.msg;
      }
      return 'خطأ في التحقق من البيانات';
    });
    
    res.status(400).json({ 
      error: 'خطأ في التحقق من البيانات',
      details: errorMessages
    });
    return;
  }
  
  next();
}

// Not found handler
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'المسار غير موجود' });
}

export default { errorHandler, validate, notFoundHandler };
