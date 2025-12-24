import { query } from '../config/database.js';
import { Request } from 'express';
import { AuthRequest } from '../middleware/auth.js';

interface AuditLogData {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    const sql = `
      INSERT INTO AuditLog (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await query(sql, [
      data.userId,
      data.action,
      data.entityType,
      data.entityId,
      data.oldValue ? JSON.stringify(data.oldValue) : null,
      data.newValue ? JSON.stringify(data.newValue) : null,
      data.ipAddress || null,
      data.userAgent || null,
    ]);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent audit log failures from breaking operations
  }
}

export function getClientInfo(req: Request): { ipAddress: string; userAgent: string } {
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

export async function logAction(
  req: AuthRequest,
  action: string,
  entityType: string,
  entityId: number,
  oldValue?: any,
  newValue?: any
): Promise<void> {
  if (!req.user) return;
  
  const { ipAddress, userAgent } = getClientInfo(req);
  
  await createAuditLog({
    userId: req.user.id,
    action,
    entityType,
    entityId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
  });
}

export async function getAuditLogs(
  page: number = 1,
  limit: number = 50,
  filters?: {
    userId?: number;
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ logs: any[]; total: number; page: number; totalPages: number }> {
  const offset = (page - 1) * limit;
  
  let whereConditions: string[] = [];
  let params: any[] = [];
  
  if (filters?.userId) {
    whereConditions.push('al.user_id = ?');
    params.push(filters.userId);
  }
  
  if (filters?.entityType) {
    whereConditions.push('al.entity_type = ?');
    params.push(filters.entityType);
  }
  
  if (filters?.action) {
    whereConditions.push('al.action = ?');
    params.push(filters.action);
  }
  
  if (filters?.startDate) {
    whereConditions.push('al.created_at >= ?');
    params.push(filters.startDate);
  }
  
  if (filters?.endDate) {
    whereConditions.push('al.created_at <= ?');
    params.push(filters.endDate);
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // Get total count
  const countSql = `SELECT COUNT(*) as total FROM AuditLog al ${whereClause}`;
  const countResult: any = await query(countSql, params);
  const total = countResult[0]?.total || 0;
  
  // Get logs
  const logsSql = `
    SELECT 
      al.*,
      u.username,
      u.full_name
    FROM AuditLog al
    LEFT JOIN Users u ON al.user_id = u.id
    ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  const logs: any = await query(logsSql, [...params, limit, offset]);
  
  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export default { createAuditLog, logAction, getAuditLogs, getClientInfo };
