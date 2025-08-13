import pool from '../config/database';

export interface Document {
  id: string;
  claim_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: Date;
}

export interface DocumentInput {
  claim_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
}

export class DocumentModel {
  // Create a new document
  static async create(documentData: DocumentInput): Promise<Document> {
    const {
      claim_id,
      document_type,
      file_name,
      file_path,
      file_size,
      mime_type,
      uploaded_by
    } = documentData;
    
    const query = `
      INSERT INTO documents (
        claim_id,
        document_type,
        file_name,
        file_path,
        file_size,
        mime_type,
        uploaded_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      claim_id,
      document_type,
      file_name,
      file_path,
      file_size,
      mime_type,
      uploaded_by
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  // Get documents by claim ID
  static async findByClaimId(claimId: string): Promise<Document[]> {
    const query = 'SELECT * FROM documents WHERE claim_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [claimId]);
    
    return result.rows;
  }
  
  // Get document by ID
  static async findById(id: string): Promise<Document | null> {
    const query = 'SELECT * FROM documents WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }
  
  // Delete document
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM documents WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    
    return (result.rowCount || 0) > 0;
  }
  
  // Check if document type exists for a claim
  static async documentTypeExists(claimId: string, documentType: string): Promise<boolean> {
    const query = 'SELECT id FROM documents WHERE claim_id = $1 AND document_type = $2 LIMIT 1';
    const result = await pool.query(query, [claimId, documentType]);
    
    return (result.rowCount || 0) > 0;
  }
}