import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  submitGrievance,
  getAllGrievances,
  getMyGrievances,
  updateGrievanceStatus,
  deleteGrievance
} from '../controllers/grievanceController.js';

const router = express.Router();

// User routes
router.post('/submit', authenticateToken, submitGrievance);
router.get('/my-grievances', authenticateToken, getMyGrievances);

// Admin routes
router.get('/all', authenticateToken, getAllGrievances);
router.put('/:grievanceId', authenticateToken, updateGrievanceStatus);
router.delete('/:grievanceId', authenticateToken, deleteGrievance);

export default router;
