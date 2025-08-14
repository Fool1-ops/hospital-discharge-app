/**
 * Document type definitions
 */

export type DocumentStatus = 'COMPLETE' | 'UNCLEAR' | 'INCOMPLETE' | 'MISMATCHED' | 'VALID' | 'MISSING';

export interface Document {
  name: string;
  type: string;
  status: DocumentStatus;
}