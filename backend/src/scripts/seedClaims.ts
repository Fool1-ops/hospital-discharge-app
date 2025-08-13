import { ClaimModel, ClaimStatus } from '../models/claim';
import { DocumentModel } from '../models/document';
import { UserModel } from '../models/user';
import pool from '../config/database';

// Mock data for insurance claims
const mockClaims = [
  {
    claim_id: 'CLM001',
    patient_name: 'Rajesh Kumar',
    hospital_id: 'HOSPITAL001',
    insurer: 'Star Health',
    policy_number: 'STHL98765432',
    admission_date: '2023-10-15',
    discharge_date: '2023-10-22',
    uploaded_documents: [
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
    uploaded_documents: [
      { name: 'id_proof.pdf', type: 'ID_PROOF', status: 'COMPLETE' },
      { name: 'insurance.pdf', type: 'INSURANCE_CARD', status: 'UNCLEAR' },
      { name: 'prescription.pdf', type: 'DOCTOR_PRESCRIPTION', status: 'COMPLETE' },
      { name: 'discharge.pdf', type: 'DISCHARGE_SUMMARY', status: 'INCOMPLETE' },
      { name: 'bill.pdf', type: 'HOSPITAL_BILL', status: 'COMPLETE' }
      // Missing payment receipt and medical reports
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
    uploaded_documents: [
      { name: 'id_proof.pdf', type: 'ID_PROOF', status: 'COMPLETE' },
      { name: 'insurance.pdf', type: 'INSURANCE_CARD', status: 'COMPLETE' },
      { name: 'prescription.pdf', type: 'DOCTOR_PRESCRIPTION', status: 'COMPLETE' },
      // Missing discharge summary
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
    uploaded_documents: [
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
    uploaded_documents: [
      { name: 'id_proof.pdf', type: 'ID_PROOF', status: 'COMPLETE' },
      // Missing insurance card
      { name: 'prescription.pdf', type: 'DOCTOR_PRESCRIPTION', status: 'COMPLETE' },
      { name: 'discharge.pdf', type: 'DISCHARGE_SUMMARY', status: 'COMPLETE' },
      { name: 'bill.pdf', type: 'HOSPITAL_BILL', status: 'COMPLETE' },
      // Missing payment receipt
      { name: 'irrelevant.pdf', type: 'OTHER', status: 'MISMATCHED' } // Irrelevant document
    ],
    notes: 'Claim with missing insurance card and payment receipt, plus irrelevant document'
  }
];

async function seedClaims() {
  try {
    console.log('Starting to seed claims data...');
    
    // Get admin user for created_by field
    const adminEmail = 'admin@hospital.com';
    const admin = await UserModel.findByEmail(adminEmail);
    
    if (!admin) {
      throw new Error('Admin user not found. Please run database initialization first.');
    }
    
    console.log(`Found admin user with ID: ${admin.id}`);
    
    // Insert each claim and its documents
    for (const mockClaim of mockClaims) {
      // Create the claim
      const claim = await ClaimModel.create({
        patient_name: mockClaim.patient_name,
        hospital_id: mockClaim.hospital_id,
        insurer: mockClaim.insurer,
        policy_number: mockClaim.policy_number,
        admission_date: new Date(mockClaim.admission_date),
        estimated_discharge_date: new Date(mockClaim.discharge_date),
        created_by: admin.id
      });
      
      console.log(`Created claim: ${claim.id} for patient: ${mockClaim.patient_name}`);
      
      // Add documents for this claim
      for (const doc of mockClaim.uploaded_documents) {
        await DocumentModel.create({
          claim_id: claim.id,
          document_type: doc.type,
          file_name: doc.name,
          file_path: `/uploads/${mockClaim.claim_id}/${doc.name}`,
          file_size: 1024, // Mock file size
          mime_type: doc.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          uploaded_by: admin.id
        });
      }
      
      console.log(`Added ${mockClaim.uploaded_documents.length} documents to claim ${claim.id}`);
      
      // Update claim status based on notes
      if (mockClaim.notes.includes('Complete claim')) {
        await ClaimModel.updateStatus(claim.id, ClaimStatus.SUBMITTED);
        console.log(`Updated claim ${claim.id} status to SUBMITTED`);
      }
    }
    
    console.log('Claims data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding claims data:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the seed function
seedClaims();