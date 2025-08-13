import express from 'express';
import {
  getTotalClaims,
  getApprovalRate,
  getAverageProcessingTime,
  getClaimsByStatus,
  getDashboardAnalytics
} from '../controllers/analytics';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Individual analytics endpoints
router.get('/hospital/:hospital_id/total', getTotalClaims);
router.get('/hospital/:hospital_id/approval-rate', getApprovalRate);
router.get('/hospital/:hospital_id/avg-processing-time', getAverageProcessingTime);
router.get('/hospital/:hospital_id/by-status', getClaimsByStatus);

// Combined dashboard analytics
router.get('/hospital/:hospital_id/dashboard', getDashboardAnalytics);

export default router;