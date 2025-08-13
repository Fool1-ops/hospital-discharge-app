// Required document types for insurance claims
export enum DocumentType {
  ADMISSION_FORM = 'admission_form',
  INSURANCE_CARD = 'insurance_card',
  ID_PROOF = 'id_proof',
  DOCTOR_PRESCRIPTION = 'doctor_prescription',
  MEDICAL_REPORTS = 'medical_reports'
}

// Document type display names
export const documentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.ADMISSION_FORM]: 'Hospital Admission Form',
  [DocumentType.INSURANCE_CARD]: 'Insurance Card',
  [DocumentType.ID_PROOF]: 'ID Proof',
  [DocumentType.DOCTOR_PRESCRIPTION]: 'Doctor Prescription',
  [DocumentType.MEDICAL_REPORTS]: 'Medical Reports'
};

// Get required documents based on insurer
export const getRequiredDocuments = (insurer: string): DocumentType[] => {
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
  } else {
    return [...standardDocuments, DocumentType.MEDICAL_REPORTS];
  }
};

// Check if a document is required for a specific insurer
export const isDocumentRequired = (documentType: string, insurer: string): boolean => {
  const requiredDocs = getRequiredDocuments(insurer);
  return requiredDocs.includes(documentType as DocumentType);
};