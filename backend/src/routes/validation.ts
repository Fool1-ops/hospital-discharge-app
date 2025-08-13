import express from 'express';
import { validateDocuments } from '../controllers/validation';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Route for validating insurance claim documents
// Temporarily removed authentication for testing
router.post('/validate', validateDocuments);

export default router;