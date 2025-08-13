import pool from '../config/database';

export interface Claim {
  id: string;
  patient_name: string;
  hospital_id: string;
  insurer: string;
  policy_number: string;
  admission_date: Date;
  estimated_discharge_date: Date;
  status: ClaimStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected'
}

export interface ClaimInput {
  patient_name: string;
  hospital_id: string;
  insurer: string;
  policy_number: string;
  admission_date: Date;
  estimated_discharge_date: Date;
  created_by: string;
}

export class ClaimModel {
  // Create a new claim
  static async create(claimData: ClaimInput): Promise<Claim> {
    const {
      patient_name,
      hospital_id,
      insurer,
      policy_number,
      admission_date,
      estimated_discharge_date,
      created_by
    } = claimData;
    
    const query = `
      INSERT INTO claims (
        patient_name,
        hospital_id,
        insurer,
        policy_number,
        admission_date,
        estimated_discharge_date,
        status,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      patient_name,
      hospital_id,
      insurer,
      policy_number,
      admission_date,
      estimated_discharge_date,
      ClaimStatus.DRAFT,
      created_by
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  // Get claim by ID
  static async findById(id: string): Promise<Claim | null> {
    const query = 'SELECT * FROM claims WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] || null;
  }
  
  // Get all claims for a hospital
  static async findByHospitalId(hospitalId: string): Promise<Claim[]> {
    const query = 'SELECT * FROM claims WHERE hospital_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [hospitalId]);
    
    return result.rows;
  }
  
  // Update claim status
  static async updateStatus(id: string, status: ClaimStatus): Promise<Claim | null> {
    const query = `
      UPDATE claims
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    return result.rows[0] || null;
  }
  
  // Get claims by status
  static async findByStatus(hospitalId: string, status: ClaimStatus): Promise<Claim[]> {
    const query = 'SELECT * FROM claims WHERE hospital_id = $1 AND status = $2 ORDER BY created_at DESC';
    const result = await pool.query(query, [hospitalId, status]);
    
    return result.rows;
  }
  
  // Get claims in progress (not paid or rejected)
  static async findInProgress(hospitalId: string): Promise<Claim[]> {
    const query = `
      SELECT * FROM claims 
      WHERE hospital_id = $1 
      AND status NOT IN ($2, $3) 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [hospitalId, ClaimStatus.PAID, ClaimStatus.REJECTED]);
    return result.rows;
  }
  
  // Get recently approved claims
  static async findRecentlyApproved(hospitalId: string, limit: number = 5): Promise<Claim[]> {
    const query = `
      SELECT * FROM claims 
      WHERE hospital_id = $1 AND status = $2 
      ORDER BY updated_at DESC 
      LIMIT $3
    `;
    
    const result = await pool.query(query, [hospitalId, ClaimStatus.APPROVED, limit]);
    return result.rows;
  }
}