/**
 * Utility functions for handling status colors and display
 */

import { DocumentStatus } from '@/types/documentTypes';

type StatusType = 'PASS' | 'FAIL' | DocumentStatus | 'MISSING';

/**
 * Returns the appropriate Tailwind CSS color class based on status
 * Using the specific colors from requirements:
 * - Green (#16a34a) for PASS/COMPLETE
 * - Red (#dc2626) for FAIL/MISSING
 * - Yellow (#facc15) for UNCLEAR
 * - Orange (#f97316) for MISMATCHED
 */
export function getStatusColor(status: StatusType): string {
  switch (status) {
    case 'PASS':
    case 'COMPLETE':
      return 'bg-green-100 text-green-800 border-green-600 border-[#16a34a]';
    case 'FAIL':
    case 'MISSING':
    case 'INCOMPLETE':
      return 'bg-red-100 text-red-800 border-red-600 border-[#dc2626]';
    case 'UNCLEAR':
      return 'bg-yellow-100 text-yellow-800 border-yellow-600 border-[#facc15]';
    case 'MISMATCHED':
      return 'bg-orange-100 text-orange-800 border-orange-600 border-[#f97316]';
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