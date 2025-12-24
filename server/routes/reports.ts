import { Router } from 'express';
import {
  getSummary,
  getMonthly,
  getByDepartment,
  exportExcel,
  exportPDF,
  exportCSV,
} from '../controllers/reportsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Statistics routes
router.get('/summary', getSummary);
router.get('/monthly', getMonthly);
router.get('/by-department', getByDepartment);

// Export routes
router.get('/export/excel', exportExcel);
router.get('/export/pdf', exportPDF);
router.get('/export/csv', exportCSV);

export default router;
