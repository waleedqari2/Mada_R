import { Request, Response } from 'express';
import { query } from '../database/connection.js';
import { generateRequestNumber } from '../utils/requestNumber.js';
import { numberToArabicWords } from '../utils/numberToArabic.js';
import { createAuditLog } from '../middleware/auditLogger.js';

/**
 * Create a new request
 */
export async function createRequest(req: Request, res: Response) {
  try {
    const {
      paymentType,
      requesterName,
      jobTitle,
      department,
      approverDepartment,
      amountInNumbers,
      notes,
      items,
    } = req.body;

    // Validate input
    if (!paymentType || !requesterName || !department || !amountInNumbers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate request number
    const requestNumber = await generateRequestNumber();

    // Convert amount to Arabic words
    const amountInWords = numberToArabicWords(parseFloat(amountInNumbers));

    // Insert request
    const sql = `
      INSERT INTO requests (
        requestNumber, paymentType, requesterName, jobTitle, department,
        approverDepartment, amountInNumbers, amountInWords, notes, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result: any = await query(sql, [
      requestNumber,
      paymentType,
      requesterName,
      jobTitle || null,
      department,
      approverDepartment || null,
      amountInNumbers,
      amountInWords,
      notes || null,
      req.user!.userId,
    ]);

    const requestId = result.insertId;

    // Insert request items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      const itemsSql = `
        INSERT INTO request_items (requestId, description, unit, quantity, unitPrice, total, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      for (const item of items) {
        await query(itemsSql, [
          requestId,
          item.description,
          item.unit || null,
          item.quantity || 1,
          item.unitPrice,
          item.total || item.quantity * item.unitPrice,
          item.notes || null,
        ]);
      }
    }

    // Create audit log
    await createAuditLog({
      userId: req.user!.userId,
      action: 'create',
      requestId,
      changes: JSON.stringify({ requestNumber, amountInNumbers }),
    });

    res.status(201).json({
      message: 'Request created successfully',
      data: { id: requestId, requestNumber },
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
}

/**
 * Get all requests with pagination
 */
export async function getAllRequests(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query<any[]>('SELECT COUNT(*) as total FROM requests');
    const total = countResult[0].total;

    // Get requests
    const sql = `
      SELECT r.*, u.username as createdByUsername
      FROM requests r
      LEFT JOIN users u ON r.createdBy = u.id
      ORDER BY r.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const requests = await query<any[]>(sql, [limit, offset]);

    res.json({
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
}

/**
 * Get a specific request
 */
export async function getRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT r.*, u.username as createdByUsername
      FROM requests r
      LEFT JOIN users u ON r.createdBy = u.id
      WHERE r.id = ?
    `;

    const requests = await query<any[]>(sql, [id]);

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get request items
    const itemsSql = 'SELECT * FROM request_items WHERE requestId = ?';
    const items = await query<any[]>(itemsSql, [id]);

    res.json({
      data: {
        ...requests[0],
        items,
      },
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to get request' });
  }
}

/**
 * Update a request
 */
export async function updateRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      paymentType,
      requesterName,
      jobTitle,
      department,
      approverDepartment,
      amountInNumbers,
      notes,
    } = req.body;

    // Check if request exists
    const existing = await query<any[]>('SELECT id FROM requests WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Convert amount to Arabic words if amount changed
    const amountInWords = amountInNumbers
      ? numberToArabicWords(parseFloat(amountInNumbers))
      : undefined;

    const sql = `
      UPDATE requests
      SET
        paymentType = COALESCE(?, paymentType),
        requesterName = COALESCE(?, requesterName),
        jobTitle = COALESCE(?, jobTitle),
        department = COALESCE(?, department),
        approverDepartment = COALESCE(?, approverDepartment),
        amountInNumbers = COALESCE(?, amountInNumbers),
        amountInWords = COALESCE(?, amountInWords),
        notes = COALESCE(?, notes),
        updatedBy = ?
      WHERE id = ?
    `;

    await query(sql, [
      paymentType,
      requesterName,
      jobTitle,
      department,
      approverDepartment,
      amountInNumbers,
      amountInWords,
      notes,
      req.user!.userId,
      id,
    ]);

    // Create audit log
    await createAuditLog({
      userId: req.user!.userId,
      action: 'update',
      requestId: parseInt(id),
      changes: JSON.stringify(req.body),
    });

    res.json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
}

/**
 * Delete a request
 */
export async function deleteRequest(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if request exists
    const existing = await query<any[]>('SELECT id FROM requests WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Delete request (cascade will delete items and audit logs)
    await query('DELETE FROM requests WHERE id = ?', [id]);

    // Create audit log
    await createAuditLog({
      userId: req.user!.userId,
      action: 'delete',
      requestId: parseInt(id),
    });

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
}

/**
 * Update request status
 */
export async function updateStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['تم التعميد', 'في انتظار', 'موافق', 'تم التنفيذ'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update timestamps based on status
    let additionalFields = '';
    if (status === 'موافق') {
      additionalFields = ', approvalDate = CURRENT_TIMESTAMP';
    } else if (status === 'تم التنفيذ') {
      additionalFields = ', implementationDate = CURRENT_TIMESTAMP';
    }

    const sql = `
      UPDATE requests
      SET status = ?, updatedBy = ?${additionalFields}
      WHERE id = ?
    `;

    await query(sql, [status, req.user!.userId, id]);

    // Create audit log
    await createAuditLog({
      userId: req.user!.userId,
      action: 'status_change',
      requestId: parseInt(id),
      changes: JSON.stringify({ status }),
    });

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
}

/**
 * Add signature to request
 */
export async function addSignature(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { signatureType, signatureData } = req.body;

    const validTypes = ['approverSignature', 'managerSignature', 'accountantSignature'];

    if (!signatureType || !validTypes.includes(signatureType)) {
      return res.status(400).json({ error: 'Invalid signature type' });
    }

    const sql = `
      UPDATE requests
      SET ${signatureType} = ?, updatedBy = ?
      WHERE id = ?
    `;

    await query(sql, [signatureData, req.user!.userId, id]);

    // Create audit log
    await createAuditLog({
      userId: req.user!.userId,
      action: 'signature_add',
      requestId: parseInt(id),
      changes: JSON.stringify({ signatureType }),
    });

    res.json({ message: 'Signature added successfully' });
  } catch (error) {
    console.error('Add signature error:', error);
    res.status(500).json({ error: 'Failed to add signature' });
  }
}

/**
 * Search requests
 */
export async function searchRequests(req: Request, res: Response) {
  try {
    const { query: searchQuery } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const sql = `
      SELECT r.*, u.username as createdByUsername
      FROM requests r
      LEFT JOIN users u ON r.createdBy = u.id
      WHERE r.requestNumber LIKE ?
         OR r.requesterName LIKE ?
         OR r.department LIKE ?
      ORDER BY r.createdAt DESC
      LIMIT 50
    `;

    const searchPattern = `%${searchQuery}%`;
    const results = await query<any[]>(sql, [searchPattern, searchPattern, searchPattern]);

    res.json({ data: results });
  } catch (error) {
    console.error('Search requests error:', error);
    res.status(500).json({ error: 'Failed to search requests' });
  }
}

/**
 * Filter requests
 */
export async function filterRequests(req: Request, res: Response) {
  try {
    const { status, department, startDate, endDate } = req.query;

    let sql = `
      SELECT r.*, u.username as createdByUsername
      FROM requests r
      LEFT JOIN users u ON r.createdBy = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    if (department) {
      sql += ' AND r.department = ?';
      params.push(department);
    }

    if (startDate) {
      sql += ' AND r.createdAt >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND r.createdAt <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY r.createdAt DESC LIMIT 100';

    const results = await query<any[]>(sql, params);

    res.json({ data: results });
  } catch (error) {
    console.error('Filter requests error:', error);
    res.status(500).json({ error: 'Failed to filter requests' });
  }
}
