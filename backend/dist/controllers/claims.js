"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentlyApprovedClaims = exports.getClaimsInProgress = exports.generateInsurerPacket = exports.getClaimDocuments = exports.uploadDocument = exports.updateClaimStatus = exports.getClaimsByHospital = exports.getClaimById = exports.createClaim = void 0;
const claim_1 = require("../models/claim");
const document_1 = require("../models/document");
const documentChecklist_1 = require("../utils/documentChecklist");
const s3_1 = require("../config/s3");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Configure multer for S3 uploads
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3_1.s3,
        bucket: s3_1.bucketName,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const fileExtension = path_1.default.extname(file.originalname);
            const fileName = `${(0, uuid_1.v4)()}${fileExtension}`;
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
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
        }
    }
});
// Create a new claim
const createClaim = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const { patient_name, hospital_id, insurer, policy_number, admission_date, estimated_discharge_date } = req.body;
        // Validate input
        if (!patient_name || !hospital_id || !insurer || !policy_number || !admission_date || !estimated_discharge_date) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Create new claim
        const newClaim = yield claim_1.ClaimModel.create({
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
    }
    catch (error) {
        console.error('Create claim error:', error);
        res.status(500).json({ message: 'Server error while creating claim' });
    }
});
exports.createClaim = createClaim;
// Get claim by ID
const getClaimById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const claim = yield claim_1.ClaimModel.findById(id);
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }
        // Get documents for this claim
        const documents = yield document_1.DocumentModel.findByClaimId(id);
        // Get required documents for this insurer
        const requiredDocuments = (0, documentChecklist_1.getRequiredDocuments)(claim.insurer);
        // Create document checklist with status
        const documentChecklist = requiredDocuments.map(docType => {
            const uploaded = documents.some(doc => doc.document_type === docType);
            return {
                type: docType,
                label: documentChecklist_1.documentTypeLabels[docType],
                uploaded,
                document: uploaded ? documents.find(doc => doc.document_type === docType) : null
            };
        });
        res.status(200).json({
            claim,
            documents,
            documentChecklist
        });
    }
    catch (error) {
        console.error('Get claim error:', error);
        res.status(500).json({ message: 'Server error while fetching claim' });
    }
});
exports.getClaimById = getClaimById;
// Get all claims for a hospital
const getClaimsByHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const { hospital_id } = req.params;
        const claims = yield claim_1.ClaimModel.findByHospitalId(hospital_id);
        res.status(200).json({ claims });
    }
    catch (error) {
        console.error('Get claims error:', error);
        res.status(500).json({ message: 'Server error while fetching claims' });
    }
});
exports.getClaimsByHospital = getClaimsByHospital;
// Update claim status
const updateClaimStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const { id } = req.params;
        const { status } = req.body;
        // Validate status
        if (!Object.values(claim_1.ClaimStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        const updatedClaim = yield claim_1.ClaimModel.updateStatus(id, status);
        if (!updatedClaim) {
            return res.status(404).json({ message: 'Claim not found' });
        }
        res.status(200).json({
            message: 'Claim status updated successfully',
            claim: updatedClaim
        });
    }
    catch (error) {
        console.error('Update claim status error:', error);
        res.status(500).json({ message: 'Server error while updating claim status' });
    }
});
exports.updateClaimStatus = updateClaimStatus;
// Upload document for a claim
const uploadDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadSingle = upload.single('document');
    uploadSingle(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            const { claim_id, document_type } = req.body;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            if (!claim_id || !document_type) {
                return res.status(400).json({ message: 'Claim ID and document type are required' });
            }
            // Check if claim exists
            const claim = yield claim_1.ClaimModel.findById(claim_id);
            if (!claim) {
                return res.status(404).json({ message: 'Claim not found' });
            }
            // Create document record
            const newDocument = yield document_1.DocumentModel.create({
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
        }
        catch (error) {
            console.error('Upload document error:', error);
            res.status(500).json({ message: 'Server error while uploading document' });
        }
    }));
});
exports.uploadDocument = uploadDocument;
// Get documents for a claim
const getClaimDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { claim_id } = req.params;
        const documents = yield document_1.DocumentModel.findByClaimId(claim_id);
        res.status(200).json({ documents });
    }
    catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ message: 'Server error while fetching documents' });
    }
});
exports.getClaimDocuments = getClaimDocuments;
// Generate insurer packet (combine data and documents)
const generateInsurerPacket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { claim_id } = req.params;
        // Get claim details
        const claim = yield claim_1.ClaimModel.findById(claim_id);
        if (!claim) {
            return res.status(404).json({ message: 'Claim not found' });
        }
        // Get documents for this claim
        const documents = yield document_1.DocumentModel.findByClaimId(claim_id);
        // Get required documents for this insurer
        const requiredDocuments = (0, documentChecklist_1.getRequiredDocuments)(claim.insurer);
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
                Bucket: s3_1.bucketName,
                Key: doc.file_path,
                Expires: 3600 // URL expires in 1 hour
            };
            const url = s3_1.s3.getSignedUrl('getObject', params);
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
    }
    catch (error) {
        console.error('Generate packet error:', error);
        res.status(500).json({ message: 'Server error while generating insurer packet' });
    }
});
exports.generateInsurerPacket = generateInsurerPacket;
// Get claims in progress
const getClaimsInProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospital_id } = req.params;
        const claims = yield claim_1.ClaimModel.findInProgress(hospital_id);
        res.status(200).json({ claims });
    }
    catch (error) {
        console.error('Get claims in progress error:', error);
        res.status(500).json({ message: 'Server error while fetching claims in progress' });
    }
});
exports.getClaimsInProgress = getClaimsInProgress;
// Get recently approved claims
const getRecentlyApprovedClaims = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospital_id } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        const claims = yield claim_1.ClaimModel.findRecentlyApproved(hospital_id, limit);
        res.status(200).json({ claims });
    }
    catch (error) {
        console.error('Get recently approved claims error:', error);
        res.status(500).json({ message: 'Server error while fetching recently approved claims' });
    }
});
exports.getRecentlyApprovedClaims = getRecentlyApprovedClaims;
