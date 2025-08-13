import { DocumentType } from './documentChecklist';

// Define the document validation response structure
export interface DocumentValidationResult {
  missing: string[];
  issues: string[];
  status: 'PASS' | 'FAIL';
  notes: string;
}

// Define the document input structure
export interface DocumentInput {
  name: string;
  type: string;
  status?: 'VALID' | 'COMPLETE' | 'UNCLEAR' | 'INCOMPLETE' | 'MISMATCHED';
}

/**
 * Validates insurance claim documents against insurer requirements
 * @param insurerName The name of the insurance company
 * @param claimType The type of claim (e.g., 'Cashless Hospitalization')
 * @param uploadedDocuments List of uploaded documents
 * @returns DocumentValidationResult with validation status
 */
export const validateClaimDocuments = (
  insurerName: string,
  claimType: string,
  uploadedDocuments: DocumentInput[]
): DocumentValidationResult => {
  // Define required documents for cashless hospitalization
  const requiredDocuments = [
    'Patient ID Proof',
    'Insurance Policy Copy',
    'Doctor\'s Admission Notes',
    'Discharge Summary',
    'Final Hospital Bill with Breakup',
    'Payment Receipts',
    'Lab/Diagnostic Reports'
  ];

  // Map document types to required documents
  const documentTypeMap: Record<string, string> = {
    'ID_PROOF': 'Patient ID Proof',
    'INSURANCE_CARD': 'Insurance Policy Copy',
    'DOCTOR_PRESCRIPTION': 'Doctor\'s Admission Notes',
    'DISCHARGE_SUMMARY': 'Discharge Summary',
    'HOSPITAL_BILL': 'Final Hospital Bill with Breakup',
    'PAYMENT_RECEIPT': 'Payment Receipts',
    'MEDICAL_REPORTS': 'Lab/Diagnostic Reports'
  };

  // Get the document names that have been uploaded
  const uploadedDocTypes = uploadedDocuments.map(doc => documentTypeMap[doc.type] || doc.name);
  
  // Check which required documents are missing
  const missing = requiredDocuments.filter(doc => {
    // Special case for Lab/Diagnostic Reports which might be optional
    if (doc === 'Lab/Diagnostic Reports' && !isLabReportRequired(insurerName, claimType)) {
      return false;
    }
    return !uploadedDocTypes.includes(doc);
  });

  // Identify documents with issues
  const issues: string[] = [];
  
  // Check for documents with problematic status
  uploadedDocuments.forEach(doc => {
    if (!doc.status) {
      issues.push(`${doc.name} - document status not provided`);
    } else if (doc.status !== 'COMPLETE' && doc.status !== 'VALID') {
      issues.push(`${doc.name} - ${getIssueDescription(doc.status)}`);
    }
  });

  // Determine overall status
  const status = missing.length === 0 && issues.length === 0 ? 'PASS' : 'FAIL';

  // Generate human-readable summary
  let notes = '';
  if (missing.length > 0 && issues.length > 0) {
    notes = `${missing.length} required document(s) missing and ${issues.length} document(s) have issues.`;
  } else if (missing.length > 0) {
    notes = `${missing.length} required document(s) missing.`;
  } else if (issues.length > 0) {
    notes = `${issues.length} document(s) have issues.`;
  } else {
    notes = 'All required documents are present and valid.';
  }

  return {
    missing,
    issues,
    status,
    notes
  };
};

/**
 * Determines if lab reports are required based on insurer and claim type
 * @param insurerName The name of the insurance company
 * @param claimType The type of claim
 * @returns boolean indicating if lab reports are required
 */
const isLabReportRequired = (insurerName: string, claimType: string): boolean => {
  // This logic would be more complex in a real application
  // For now, we'll assume lab reports are required for all except specific insurers
  const exemptInsurers = ['BasicCare', 'MinimalCover', 'EssentialHealth'];
  return !exemptInsurers.includes(insurerName);
};

/**
 * Gets a human-readable description for document issues
 * @param status The status of the document
 * @returns A description of the issue
 */
const getIssueDescription = (status?: string): string => {
  switch (status) {
    case 'UNCLEAR':
      return 'document is unclear or illegible';
    case 'INCOMPLETE':
      return 'document is incomplete';
    case 'MISMATCHED':
      return 'document information does not match claim details';
    default:
      return 'unknown issue';
  }
};