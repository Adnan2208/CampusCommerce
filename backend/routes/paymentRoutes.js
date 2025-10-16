import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  initiatePayment,
  completePayment,
  getPaymentStatus,
  markCashPayment
} from '../controllers/paymentController.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticateToken);

// Initiate payment - Get UPI details for payment
router.get('/:orderId/initiate', initiatePayment);

// Complete payment - Mark payment as done with transaction ID
router.post('/:orderId/complete', completePayment);

// Get payment status
router.get('/:orderId/status', getPaymentStatus);

// Mark cash payment
router.post('/:orderId/cash', markCashPayment);

export default router;
