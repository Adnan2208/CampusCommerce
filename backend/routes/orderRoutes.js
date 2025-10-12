import express from 'express';
import {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All order routes require authentication
router.post('/', authenticateToken, createOrder); // Place order
router.get('/my-orders', authenticateToken, getMyOrders); // Get orders placed by user
router.get('/received-orders', authenticateToken, getReceivedOrders); // Get orders received by user as seller
router.patch('/:id/status', authenticateToken, updateOrderStatus); // Update order status (seller only)
router.patch('/:id/cancel', authenticateToken, cancelOrder); // Cancel order (buyer only)

export default router;
