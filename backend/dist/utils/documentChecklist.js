"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDocumentRequired = exports.getRequiredDocuments = exports.documentTypeLabels = exports.DocumentType = void 0;
// Required document types for insurance claims
var DocumentType;
(function (DocumentType) {
    DocumentType["ADMISSION_FORM"] = "admission_form";
    DocumentType["INSURANCE_CARD"] = "insurance_card";
    DocumentType["ID_PROOF"] = "id_proof";
    DocumentType["DOCTOR_PRESCRIPTION"] = "doctor_prescription";
    DocumentType["MEDICAL_REPORTS"] = "medical_reports";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
// Document type display names
exports.documentTypeLabels = {
    [DocumentType.ADMISSION_FORM]: 'Hospital Admission Form',
    [DocumentType.INSURANCE_CARD]: 'Insurance Card',
    [DocumentType.ID_PROOF]: 'ID Proof',
    [DocumentType.DOCTOR_PRESCRIPTION]: 'Doctor Prescription',
    [DocumentType.MEDICAL_REPORTS]: 'Medical Reports'
};
// Get required documents based on insurer
const getRequiredDocuments = (insurer) => {
    // In a real application, this would be more dynamic based on insurer requirements
    // For MVP, we'll hardcode a standard set of required documents
    const standardDocuments = [
        DocumentType.ADMISSION_FORM,
        DocumentType.INSURANCE_CARD,
        DocumentType.ID_PROOF,
        DocumentType.DOCTOR_PRESCRIPTION
    ];
    // Some insurers might require additional documents
    if (insurer.toLowerCase().includes('premium') ||
        insurer.toLowerCase().includes('gold')) {
        return standardDocuments;
    }
    else {
        return [...standardDocuments, DocumentType.MEDICAL_REPORTS];
    }
};
exports.getRequiredDocuments = getRequiredDocuments;
// Check if a document is required for a specific insurer
const isDocumentRequired = (documentType, insurer) => {
    const requiredDocs = (0, exports.getRequiredDocuments)(insurer);
    return requiredDocs.includes(documentType);
};
exports.isDocumentRequired = isDocumentRequired;
