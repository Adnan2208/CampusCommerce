import express from 'express';
import {
  createOrder,
  getMyOrders,
  getReceivedOrders,
  updateOrderStatus,
  cancelOrder,
  enableLiveTracking,
  updateLiveLocation,
  getLiveTracking
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All order routes require authentication
router.post('/', authenticateToken, createOrder); // Place order
router.get('/my-orders', authenticateToken, getMyOrders); // Get orders placed by user
router.get('/received-orders', authenticateToken, getReceivedOrders); // Get orders received by user as seller
router.patch('/:id/status', authenticateToken, updateOrderStatus); // Update order status (seller only)
router.patch('/:id/cancel', authenticateToken, cancelOrder); // Cancel order (buyer only)

// Live tracking routes
router.post('/:orderId/enable-tracking', authenticateToken, enableLiveTracking); // Enable tracking for accepted order
router.patch('/:orderId/update-location', authenticateToken, updateLiveLocation); // Update user's live location
router.get('/:orderId/tracking', authenticateToken, getLiveTracking); // Get live tracking data

export default router;
