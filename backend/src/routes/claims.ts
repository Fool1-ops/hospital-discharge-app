import express from 'express';
import {
  createClaim,
  getClaimById,
  getClaimsByHospital,
  updateClaimStatus,
  uploadDocument,
  getClaimDocuments,
  generateInsurerPacket,
  getClaimsInProgress,
  getRecentlyApprovedClaims
} from '../controllers/claims';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Claim routes
router.post('/', createClaim);
router.get('/:id', getClaimById);
router.get('/hospital/:hospital_id', getClaimsByHospital);
router.put('/:id/status', updateClaimStatus);

// Document routes
router.post('/documents', uploadDocument);
router.get('/:claim_id/documents', getClaimDocuments);

// Generate insurer packet
router.get('/:claim_id/generate-packet', generateInsurerPacket);

// Dashboard-specific routes
router.get('/hospital/:hospital_id/in-progress', getClaimsInProgress);
router.get('/hospital/:hospital_id/recently-approved', getRecentlyApprovedClaims);

export default router;