"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const claims_1 = require("../controllers/claims");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
// Claim routes
router.post('/', claims_1.createClaim);
router.get('/:id', claims_1.getClaimById);
router.get('/hospital/:hospital_id', claims_1.getClaimsByHospital);
router.put('/:id/status', claims_1.updateClaimStatus);
// Document routes
router.post('/documents', claims_1.uploadDocument);
router.get('/:claim_id/documents', claims_1.getClaimDocuments);
// Generate insurer packet
router.get('/:claim_id/generate-packet', claims_1.generateInsurerPacket);
// Dashboard-specific routes
router.get('/hospital/:hospital_id/in-progress', claims_1.getClaimsInProgress);
router.get('/hospital/:hospital_id/recently-approved', claims_1.getRecentlyApprovedClaims);
exports.default = router;
