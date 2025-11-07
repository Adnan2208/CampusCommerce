import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  markAsSold,
  getUserProducts,
  adminDelistProduct
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Product routes
router.get('/', getAllProducts); // Public - anyone can view products
router.get('/my-products', authenticateToken, getUserProducts); // Protected - get user's own products including delisted
router.get('/:id', getProductById); // Public - anyone can view product details
router.post('/', authenticateToken, createProduct); // Protected - only authenticated users can create
router.put('/:id', authenticateToken, updateProduct); // Protected - only owner can update
router.delete('/:id', authenticateToken, deleteProduct); // Protected - only owner can delete
router.patch('/:id/sold', authenticateToken, markAsSold); // Protected - only owner can mark as sold
router.delete('/:id/admin-delist', authenticateToken, adminDelistProduct); // Admin only - delist any product

export default router;
