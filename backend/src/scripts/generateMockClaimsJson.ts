/**
 * This script generates mock insurance claim data and outputs it as JSON
 * It doesn't require a database connection
 */

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

// Output the mock claims as JSON
console.log(JSON.stringify(mockClaims, null, 2));