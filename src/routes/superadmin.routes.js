import express from 'express';
import {
  getAllVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  suspendVendor,
  updateVendorCommission,
  getPlatformStats,
} from '../controllers/superAdminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require SuperAdmin authentication
router.use(protect);
router.use(authorize('SUPERADMIN'));

// Platform stats
router.get('/stats', getPlatformStats);

// Vendor management
router.get('/vendors', getAllVendors);
router.get('/vendors/:id', getVendorById);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.put('/vendors/:id/suspend', suspendVendor);
router.put('/vendors/:id/commission', updateVendorCommission);

export default router;
