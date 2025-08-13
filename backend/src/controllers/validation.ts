import { Request, Response } from 'express';
import { validateClaimDocuments, DocumentInput } from '../utils/documentValidator';

/**
 * Validates insurance claim documents against insurer requirements
 * @param req Request with insurer name, claim type, and uploaded documents
 * @param res Response with validation results
 */
export const validateDocuments = (req: Request, res: Response) => {
  try {
    const { insurerName, claimType, uploadedDocuments } = req.body;

    // Validate request body
    if (!insurerName || !claimType || !uploadedDocuments || !Array.isArray(uploadedDocuments)) {
      return res.status(400).json({
        error: 'Invalid request. Required fields: insurerName, claimType, uploadedDocuments (array)'
      });
    }

    // Validate each document in the array has required properties
    const invalidDocs = uploadedDocuments.filter(doc => !doc.name || !doc.type);
    if (invalidDocs.length > 0) {
      return res.status(400).json({
        error: 'Each document must have name and type properties'
      });
    }

    // Process the validation
    const result = validateClaimDocuments(
      insurerName,
      claimType,
      uploadedDocuments as DocumentInput[]
    );

    // Return the validation result
    return res.status(200).json(result);
  } catch (error) {
    console.error('Document validation error:', error);
    return res.status(500).json({
      error: 'An error occurred during document validation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};