import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  getVendorProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);

// Vendor-only routes (MUST be before /:id routes!)
router.post('/', protect, authorize('VENDOR'), createProduct);
router.get('/vendor/my-products', protect, authorize('VENDOR'), getVendorProducts);

// Public single product route (MUST be after specific routes!)
router.get('/:id', getProductById);

// Vendor update/delete (protected :id routes)
router.put('/:id', protect, authorize('VENDOR'), updateProduct);
router.delete('/:id', protect, authorize('VENDOR'), deleteProduct);

export default router;
