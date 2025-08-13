"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const analytics_1 = require("../controllers/analytics");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticate);
// Individual analytics endpoints
router.get('/hospital/:hospital_id/total', analytics_1.getTotalClaims);
router.get('/hospital/:hospital_id/approval-rate', analytics_1.getApprovalRate);
router.get('/hospital/:hospital_id/avg-processing-time', analytics_1.getAverageProcessingTime);
router.get('/hospital/:hospital_id/by-status', analytics_1.getClaimsByStatus);
// Combined dashboard analytics
router.get('/hospital/:hospital_id/dashboard', analytics_1.getDashboardAnalytics);
exports.default = router;
