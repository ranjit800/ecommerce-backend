import express from 'express';
import { getShopBySlug } from '../controllers/shopController.js';

const router = express.Router();

router.get('/:slug', getShopBySlug);

export default router;
