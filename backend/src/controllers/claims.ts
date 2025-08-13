import { Request, Response } from 'express';
import { ClaimModel, ClaimStatus } from '../models/claim';
import { DocumentModel } from '../models/document';
import { getRequiredDocuments, DocumentType, documentTypeLabels } from '../utils/documentChecklist';
import { s3, bucketName } from '../config/s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for S3 uploads
const upload = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: bucketName,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      cb(null, `documents/${fileName}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
    }
  }
});

// Create a new claim
export const createClaim = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const {
      patient_name,
      hospital_id,
      insurer,
      policy_number,
      admission_date,
      estimated_discharge_date
    } = req.body;
    
    // Validate input
    if (!patient_name || !hospital_id || !insurer || !policy_number || !admission_date || !estimated_discharge_date) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Create new claim
    const newClaim = await ClaimModel.create({
      patient_name,
      hospital_id,
      insurer,
      policy_number,
      admission_date: new Date(admission_date),
      estimated_discharge_date: new Date(estimated_discharge_date),
      created_by: req.user.userId
    });
    
    res.status(201).json({
      message: 'Claim created successfully',
      claim: newClaim
    });
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({ message: 'Server error while creating claim' });
  }
};

// Get claim by ID
export const getClaimById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const claim = await ClaimModel.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    // Get documents for this claim
    const documents = await DocumentModel.findByClaimId(id);
    
    // Get required documents for this insurer
    const requiredDocuments = getRequiredDocuments(claim.insurer);
    
    // Create document checklist with status
    const documentChecklist = requiredDocuments.map(docType => {
      const uploaded = documents.some(doc => doc.document_type === docType);
      return {
        type: docType,
        label: documentTypeLabels[docType as DocumentType],
        uploaded,
        document: uploaded ? documents.find(doc => doc.document_type === docType) : null
      };
    });
    
    res.status(200).json({
      claim,
      documents,
      documentChecklist
    });
  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({ message: 'Server error while fetching claim' });
  }
};

// Get all claims for a hospital
export const getClaimsByHospital = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { hospital_id } = req.params;
    
    const claims = await ClaimModel.findByHospitalId(hospital_id);
    
    res.status(200).json({ claims });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ message: 'Server error while fetching claims' });
  }
};

// Update claim status
export const updateClaimStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!Object.values(ClaimStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const updatedClaim = await ClaimModel.updateStatus(id, status);
    if (!updatedClaim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    res.status(200).json({
      message: 'Claim status updated successfully',
      claim: updatedClaim
    });
  } catch (error) {
    console.error('Update claim status error:', error);
    res.status(500).json({ message: 'Server error while updating claim status' });
  }
};

// Upload document for a claim
export const uploadDocument = async (req: Request, res: Response) => {
  const uploadSingle = upload.single('document');
  
  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const { claim_id, document_type } = req.body;
      const file = req.file as Express.MulterS3.File;
      
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      if (!claim_id || !document_type) {
        return res.status(400).json({ message: 'Claim ID and document type are required' });
      }
      
      // Check if claim exists
      const claim = await ClaimModel.findById(claim_id);
      if (!claim) {
        return res.status(404).json({ message: 'Claim not found' });
      }
      
      // Create document record
      const newDocument = await DocumentModel.create({
        claim_id,
        document_type,
        file_name: file.originalname,
        file_path: file.key,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: req.user.userId
      });
      
      res.status(201).json({
        message: 'Document uploaded successfully',
        document: newDocument
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({ message: 'Server error while uploading document' });
    }
  });
};

// Get documents for a claim
export const getClaimDocuments = async (req: Request, res: Response) => {
  try {
    const { claim_id } = req.params;
    
    const documents = await DocumentModel.findByClaimId(claim_id);
    
    res.status(200).json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error while fetching documents' });
  }
};

// Generate insurer packet (combine data and documents)
export const generateInsurerPacket = async (req: Request, res: Response) => {
  try {
    const { claim_id } = req.params;
    
    // Get claim details
    const claim = await ClaimModel.findById(claim_id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    // Get documents for this claim
    const documents = await DocumentModel.findByClaimId(claim_id);
    
    // Get required documents for this insurer
    const requiredDocuments = getRequiredDocuments(claim.insurer);
    
    // Check if all required documents are uploaded
    const missingDocuments = requiredDocuments.filter(docType => {
      return !documents.some(doc => doc.document_type === docType);
    });
    
    if (missingDocuments.length > 0) {
      return res.status(400).json({
        message: 'Cannot generate packet: Missing required documents',
        missingDocuments
      });
    }
    
    // In a real application, this would generate a PDF combining all documents
    // For MVP, we'll just return a success message with links to all documents
    
    const documentLinks = documents.map(doc => {
      // Generate a pre-signed URL for each document
      const params = {
        Bucket: bucketName,
        Key: doc.file_path,
        Expires: 3600 // URL expires in 1 hour
      };
      
      const url = s3.getSignedUrl('getObject', params);
      
      return {
        type: doc.document_type,
        name: doc.file_name,
        url
      };
    });
    
    res.status(200).json({
      message: 'Insurer packet generated successfully',
      claim,
      documents: documentLinks
    });
  } catch (error) {
    console.error('Generate packet error:', error);
    res.status(500).json({ message: 'Server error while generating insurer packet' });
  }
};

// Get claims in progress
export const getClaimsInProgress = async (req: Request, res: Response) => {
  try {
    const { hospital_id } = req.params;
    
    const claims = await ClaimModel.findInProgress(hospital_id);
    
    res.status(200).json({ claims });
  } catch (error) {
    console.error('Get claims in progress error:', error);
    res.status(500).json({ message: 'Server error while fetching claims in progress' });
  }
};

// Get recently approved claims
export const getRecentlyApprovedClaims = async (req: Request, res: Response) => {
  try {
    const { hospital_id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    const claims = await ClaimModel.findRecentlyApproved(hospital_id, limit);
    
    res.status(200).json({ claims });
  } catch (error) {
    console.error('Get recently approved claims error:', error);
    res.status(500).json({ message: 'Server error while fetching recently approved claims' });
  }
};