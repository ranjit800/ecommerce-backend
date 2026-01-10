import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartGroupedByVendor,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get('/', getCart);
router.get('/grouped', getCartGroupedByVendor);
router.post('/add', addToCart);
router.put('/update/:productId', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

export default router;
