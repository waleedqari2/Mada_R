import { query } from '../database/connection.js';

/**
 * Generate a unique sequential request number
 * Format: MADA-YYYY-XXXX (e.g., MADA-2025-0001)
 */
export async function generateRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MADA-${year}-`;

  // Get the last request number for this year
  const sql = `
    SELECT requestNumber 
    FROM requests 
    WHERE requestNumber LIKE ? 
    ORDER BY requestNumber DESC 
    LIMIT 1
  `;

  const results = await query<any[]>(sql, [`${prefix}%`]);

  let nextNumber = 1;

  if (results.length > 0) {
    const lastNumber = results[0].requestNumber;
    const lastSequence = parseInt(lastNumber.split('-')[2]);
    nextNumber = lastSequence + 1;
  }

  // Pad with zeros (e.g., 0001, 0023, 0456)
  const paddedNumber = nextNumber.toString().padStart(4, '0');

  return `${prefix}${paddedNumber}`;
}
