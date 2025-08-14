/**
 * Document type definitions
 */

export type DocumentStatus = 'COMPLETE' | 'UNCLEAR' | 'INCOMPLETE' | 'MISMATCHED' | 'MISSING';

export interface Document {
  name: string;
  type: string;
  status: DocumentStatus;
}