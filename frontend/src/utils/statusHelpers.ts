/**
 * Utility functions for handling status colors and display
 */

type StatusType = 'PASS' | 'FAIL' | 'COMPLETE' | 'MISSING' | 'UNCLEAR' | 'MISMATCHED' | 'INCOMPLETE';

/**
 * Returns the appropriate Tailwind CSS color class based on status
 */
export function getStatusColor(status: StatusType): string {
  switch (status) {
    case 'PASS':
    case 'COMPLETE':
      return 'bg-green-100 text-green-800';
    case 'FAIL':
    case 'MISSING':
    case 'INCOMPLETE':
      return 'bg-red-100 text-red-800';
    case 'UNCLEAR':
      return 'bg-yellow-100 text-yellow-800';
    case 'MISMATCHED':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Returns the validation status for a claim based on its documents
 */
export function getClaimValidationStatus(documents: Array<{ status: string }>): 'PASS' | 'FAIL' {
  const hasIssues = documents.some(doc => 
    doc.status !== 'COMPLETE'
  );
  
  return hasIssues ? 'FAIL' : 'PASS';
}