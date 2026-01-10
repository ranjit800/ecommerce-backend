import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// SuperAdmin-only routes
router.post('/', protect, authorize('SUPERADMIN'), createCategory);
router.put('/:id', protect, authorize('SUPERADMIN'), updateCategory);
router.delete('/:id', protect, authorize('SUPERADMIN'), deleteCategory);

export default router;
