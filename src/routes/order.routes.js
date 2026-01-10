import express from 'express';
import {
  createOrder,
  getMyOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

// Vendor routes
router.get('/vendor/orders', authorize('VENDOR'), getVendorOrders);

// SuperAdmin routes
router.get('/all', authorize('SUPERADMIN'), getAllOrders);

// Shared routes (must be after specific routes!)
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('VENDOR'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
