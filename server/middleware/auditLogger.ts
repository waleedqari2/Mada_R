import { Request, Response, NextFunction } from 'express';
import { query } from '../database/connection.js';

export interface AuditLogEntry {
  userId: number;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'signature_add';
  requestId?: number;
  changes?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const sql = `
      INSERT INTO audit_logs (userId, action, requestId, changes)
      VALUES (?, ?, ?, ?)
    `;

    await query(sql, [
      entry.userId,
      entry.action,
      entry.requestId || null,
      entry.changes || null,
    ]);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit log failure shouldn't block the main operation
  }
}

/**
 * Middleware to automatically log request changes
 */
export function auditLogger(action: AuditLogEntry['action']) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.json;

    // Override send function
    res.json = function (body: any) {
      // If request was successful, log it
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const requestId = req.params.id || body?.data?.id;
        
        createAuditLog({
          userId: req.user?.userId || 0,
          action,
          requestId: requestId ? parseInt(requestId) : undefined,
          changes: JSON.stringify({
            method: req.method,
            path: req.path,
            body: req.body,
          }),
        }).catch(console.error);
      }

      // Call original send
      return originalSend.call(this, body);
    };

    next();
  };
}
