import pool from '../config/database';
import dotenv from 'dotenv';
import { ClaimStatus } from '../models/claim';

// Load environment variables
dotenv.config();

// Mock claims data
const mockClaims = [
  {
    claim_id: 'CLM001',
    patient_name: 'Rajesh Kumar',
    hospital_id: 'HOSPITAL001',
    insurer: 'Star Health',
    policy_number: 'STHL98765432',
    admission_date: '2023-10-15',
    discharge_date: '2023-10-22',
    status: ClaimStatus.SUBMITTED,
    documents: [
      { name: 'id_proof.pdf', type: 'ID_PROOF', status: 'COMPLETE' },
      { name: 'insurance.pdf', type: 'INSURANCE_CARD', status: 'COMPLETE' },
      { name: 'prescription.pdf', type: 'DOCTOR_PRESCRIPTION', status: 'COMPLETE' },
      { name: 'discharge.pdf', type: 'DISCHARGE_SUMMARY', status: 'COMPLETE' },
      { name: 'bill.pdf', type: 'HOSPITAL_BILL', status: 'COMPLETE' },
      { name: 'receipt.pdf', type: 'PAYMENT_RECEIPT', status: 'COMPLETE' },
      { name: 'reports.pdf', type: 'MEDICAL_REPORTS', status: 'COMPLETE' }
    ],
    notes: 'Complete claim with all documents'
  },
  {
    claim_id: 'CLM002',
    patient_name: 'Priya Sharma',
    hospital_id: 'HOSPITAL001',
    insurer: 'Apollo Munich',
    policy_number: 'APLM87654321',
    admission_date: '2023-11-05',
    discharge_date: '2023-11-12',
    status: ClaimStatus.UNDER_REVIEW,
    documents: [
      { name: 'id_proof.pdf', type: 'ID_PROOF', status: 'COMPLETE' },
      { name: 'insurance.pdf', type: 'INSURANCE_CARD', status: 'UNCLEAR' },
      { name: 'prescription.pdf', type: 'DOCTOR_PRESCRIPTION', status: 'COMPLETE' },
      { name: 'discharge.pdf', type: 'DISCHARGE_SUMMARY', status: 'INCOMPLETE' },
      { name: 'bill.pdf', type: 'HOSPITAL_BILL', status: 'COMPLETE' }
    ],
    notes: 'Claim with unclear insurance card and incomplete discharge summary'
  },
  {
    claim_id: 'CLM003',
    patient_name: 'Amit Patel',
    hospital_id: 'HOSPITAL001',
    insurer: 'HDFC ERGO',
    policy_number: 'HDFC76543210',
    admission_date: '2023-12-10',
    discharge_date: '2023-12-18',
    status: ClaimStatus.REJECTED,
    documents: [
      { name: 'id_proof.pdf', type: 'ID_PROOF', status: 'COMPLETE' },
      { name: 'insurance.pdf', type: 'INSURANCE_CARD', status: 'COMPLETE' },
      { name: 'prescription.pdf', type: 'DOCTOR_PRESCRIPTION', status: 'COMPLETE' },
      { name: 'bill.pdf', type: 'HOSPITAL_BILL', status: 'COMPLETE' },
      { name: 'receipt.pdf', type: 'PAYMENT_RECEIPT', status: 'COMPLETE' },
      { name: 'wrong_file.jpg', type: 'MEDICAL_REPORTS', status: 'MISMATCHED' }
    ],
    notes: 'Claim with mismatched medical report (wrong file uploaded)'
  },
  {
    claim_id: 'CLM004',
    patient_name: 'Sunita Reddy',
    hospital_id: 'HOSPITAL001',
    insurer: 'Bajaj Allianz',
    policy_number: 'BJAZ65432109',
    admission_date: '2024-01-20',
    discharge_date: '2024-01-25',
    status: ClaimStatus.APPROVED,
    documents: [
      { name: 'id_proof.pdf', type: 'ID_PROOF', status: 'COMPLETE' },
      { name: 'insurance.pdf', type: 'INSURANCE_CARD', status: 'COMPLETE' },
      { name: 'prescription.pdf', type: 'DOCTOR_PRESCRIPTION', status: 'COMPLETE' },
      { name: 'discharge.pdf', type: 'DISCHARGE_SUMMARY', status: 'COMPLETE' },
      { name: 'bill.pdf', type: 'HOSPITAL_BILL', status: 'COMPLETE' },
      { name: 'receipt.pdf', type: 'PAYMENT_RECEIPT', status: 'COMPLETE' },
      { name: 'reports.pdf', type: 'MEDICAL_REPORTS', status: 'COMPLETE' }
    ],
    notes: 'Complete claim ready for processing'
  },
  {
    claim_id: 'CLM005',
    patient_name: 'Vikram Singh',
    hospital_id: 'HOSPITAL001',
    insurer: 'ICICI Lombard',
    policy_number: 'ICIC54321098',
    admission_date: '2024-02-08',
    discharge_date: '2024-02-15',
    status: ClaimStatus.DRAFT,
    documents: [
      { name: 'id_proof.pdf', type: 'ID_PROOF', status: 'COMPLETE' },
      { name: 'prescription.pdf', type: 'DOCTOR_PRESCRIPTION', status: 'COMPLETE' },
      { name: 'discharge.pdf', type: 'DISCHARGE_SUMMARY', status: 'COMPLETE' },
      { name: 'bill.pdf', type: 'HOSPITAL_BILL', status: 'COMPLETE' },
      { name: 'irrelevant.pdf', type: 'OTHER', status: 'MISMATCHED' }
    ],
    notes: 'Claim with missing insurance card and payment receipt, plus irrelevant document'
  }
];

// Function to insert mock claims into the database
async function insertMockClaims() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Get admin user ID for created_by field
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
    if (userResult.rows.length === 0) {
      throw new Error('Admin user not found');
    }
    const userId = userResult.rows[0].id;
    
    // Insert each claim and its documents
    for (const claim of mockClaims) {
      // Insert claim
      const claimResult = await client.query(
        `INSERT INTO claims 
         (claim_id, patient_name, hospital_id, insurer, policy_number, 
          admission_date, discharge_date, status, notes, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id`,
        [
          claim.claim_id,
          claim.patient_name,
          claim.hospital_id,
          claim.insurer,
          claim.policy_number,
          claim.admission_date,
          claim.discharge_date,
          claim.status,
          claim.notes,
          userId
        ]
      );
      
      const claimId = claimResult.rows[0].id;
      
      // Insert documents for this claim
      for (const doc of claim.documents) {
        await client.query(
          `INSERT INTO documents 
           (claim_id, name, type, status) 
           VALUES ($1, $2, $3, $4)`,
          [claimId, doc.name, doc.type, doc.status]
        );
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Successfully inserted mock claims data');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error inserting mock claims:', error);
  } finally {
    // Release client
    client.release();
  }
}

// Run the function
insertMockClaims()
  .then(() => {
    console.log('Mock claims insertion complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to insert mock claims:', err);
    process.exit(1);
  });