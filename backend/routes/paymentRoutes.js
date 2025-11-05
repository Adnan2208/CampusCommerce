import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import {
  initiatePayment,
  completePayment,
  getPaymentStatus,
  markCashPayment,
  approvePayment
} from '../controllers/paymentController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for payment screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// All payment routes require authentication
router.use(authenticateToken);

// Initiate payment - Get UPI details for payment
router.get('/:orderId/initiate', initiatePayment);

// Complete payment - Upload payment screenshot
router.post('/:orderId/complete', upload.single('screenshot'), completePayment);

// Get payment status
router.get('/:orderId/status', getPaymentStatus);

// Mark cash payment
router.post('/:orderId/cash', markCashPayment);

// Approve or reject payment (seller only)
router.post('/:orderId/approve', approvePayment);

export default router;
