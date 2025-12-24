import { Router } from 'express';
import {
  createRequest,
  getAllRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  updateStatus,
  addSignature,
  searchRequests,
  filterRequests,
} from '../controllers/requestsController.js';
import { authenticate } from '../middleware/auth.js';
import { auditLogger } from '../middleware/auditLogger.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.post('/', auditLogger('create'), createRequest);
router.get('/', getAllRequests);
router.get('/search', searchRequests);
router.get('/filter', filterRequests);
router.get('/:id', getRequest);
router.put('/:id', auditLogger('update'), updateRequest);
router.delete('/:id', auditLogger('delete'), deleteRequest);

// Status and signature routes
router.put('/:id/status', auditLogger('status_change'), updateStatus);
router.put('/:id/signature', auditLogger('signature_add'), addSignature);

export default router;
