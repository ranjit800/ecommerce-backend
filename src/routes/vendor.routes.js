import express from 'express';
import {
  applyAsVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorStats,
  updateShopSettings,
} from '../controllers/vendorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Vendor application (any authenticated user can apply)
router.post('/apply', applyAsVendor);

// Vendor-only routes
router.get('/profile', authorize('VENDOR'), getVendorProfile);
router.put('/profile', authorize('VENDOR'), updateVendorProfile);
router.get('/stats', authorize('VENDOR'), getVendorStats);
router.put('/shop', authorize('VENDOR'), updateShopSettings);

export default router;
