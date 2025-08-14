'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Claim } from '@/data/mockClaims';
import { DocumentStatus } from '@/types/documentTypes';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getStatusColor } from '@/utils/statusHelpers';

interface ValidationResult {
  missingDocuments: string[];
  issues: string[];
  status: 'PASS' | 'FAIL';
  notes: string;
}

export default function ClaimDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [dischargeSummary, setDischargeSummary] = useState<string>('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Perform validation on the claim documents
  const validateClaim = async (claimData: Claim) => {
    setValidating(true);
    
    try {
      // Mock validation logic
      const incompleteDocuments = claimData.uploaded_documents.filter(
        doc => doc.status !== 'COMPLETE'
      );

      const mockValidationResult: ValidationResult = {
        missingDocuments: incompleteDocuments.map(doc => doc.type),
        issues: incompleteDocuments.map(doc => 
          `${doc.type} is ${doc.status.toLowerCase()}`
        ),
        status: incompleteDocuments.length === 0 ? 'PASS' : 'FAIL',
        notes: incompleteDocuments.length === 0 
          ? 'All documents are complete and verified'
          : 'Some documents require attention'
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setValidationResult(mockValidationResult);
      return mockValidationResult;
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('Validation failed. Please try again.');
      return null;
    } finally {
      setValidating(false);
    }
  };

  // Handle submission to insurer
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmitToInsurer = async () => {
    if (!claim) return;
    
    setSubmitting(true);
    
    // First validate the claim
    const result = await validateClaim(claim);
    
    if (result && result.status === 'PASS') {
      // Simulate submission API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } else {
      // Show validation modal with issues
      setShowValidationModal(true);
    }
    
    setSubmitting(false);
  };

  useEffect(() => {
    async function fetchClaim() {
      try {
        const response = await fetch('/api/mock-claims');
        if (!response.ok) {
          throw new Error('Failed to fetch claims');
        }
        const claims = await response.json();
        const foundClaim = claims.find((c: Claim) => c.claim_id === params.id);
        if (!foundClaim) {
          throw new Error('Claim not found');
        }
        setClaim(foundClaim);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchClaim();
  }, [params.id]);
  
  // Generate discharge summary using Ollama
  const generateDischargeSummary = async () => {
    if (!claim) return;
    
    setGeneratingSummary(true);
    setError(null);
    
    try {
      const patientDetails = {
        patient_name: claim.patient_name,
        admission_date: claim.admission_date,
        discharge_date: claim.discharge_date,
        insurer: claim.insurer,
        policy_number: claim.policy_number,
        notes: claim.notes,
        // Add any other relevant fields
      };
      
      const response = await fetch('/api/discharge-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientDetails }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate discharge summary');
      }
      
      const data = await response.json();
      setDischargeSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate discharge summary');
      console.error('Discharge summary generation error:', err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Submit claim to insurer
  const submitToInsurer = async () => {
    setSubmitting(true);
    setError(null);
    
    try {
      // First validate the claim
      const result = await validateClaim(claim!);
      
      // If validation fails, show error and don't submit
      if (result && result.status === 'FAIL') {
        setError('Cannot submit claim with validation issues. Please fix the issues first.');
        setShowValidationModal(true);
        return;
      }
      
      // Mock submission to insurer
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state to show submitted
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 bg-red-50 rounded-lg shadow">{error}</div>
    );
  }

  if (!claim) {
    return (
      <div className="p-6 text-gray-500 bg-white rounded-lg shadow text-center">Claim not found</div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      case 'UNCLEAR':
        return 'bg-yellow-100 text-yellow-800';
      case 'INCOMPLETE':
        return 'bg-red-100 text-red-800';
      case 'MISMATCHED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Modal component to display validation issues
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ValidationModal = () => {
    if (!showValidationModal || !validationResult) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-xl font-bold text-red-600 mb-4">Submission Blocked</h3>
          <p className="mb-4">This claim cannot be submitted due to the following issues:</p>
          
          {validationResult.missingDocuments.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Missing or Incomplete Documents:</h4>
              <ul className="list-disc pl-5">
                {validationResult.missingDocuments.map((doc, index) => (
                  <li key={index} className="text-red-600">{doc}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validationResult.issues.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Issues Found:</h4>
              <ul className="list-disc pl-5">
                {validationResult.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowValidationModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Claims
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">Claim {claim.claim_id}</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push(`/claims/${claim.claim_id}/validation`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={validating}
            >
              Validate Claim
            </button>
            <button
              onClick={generateDischargeSummary}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={generatingSummary}
            >
              {generatingSummary ? 'Generating...' : 'Generate Discharge Summary'}
            </button>
            <button
              onClick={submitToInsurer}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              disabled={submitting || submitted}
            >
              {submitted ? 'Submitted to Insurer' : submitting ? 'Submitting...' : 'Submit to Insurer'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3">Patient Information</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Name:</div>
              <div>{claim.patient_name}</div>
              <div className="text-gray-600">Hospital ID:</div>
              <div>{claim.hospital_id}</div>
              <div className="text-gray-600">Insurer:</div>
              <div>{claim.insurer}</div>
              <div className="text-gray-600">Policy Number:</div>
              <div>{claim.policy_number}</div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3">Admission Details</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Admission Date:</div>
              <div>{new Date(claim.admission_date).toLocaleDateString()}</div>
              <div className="text-gray-600">Discharge Date:</div>
              <div>{new Date(claim.discharge_date).toLocaleDateString()}</div>
              <div className="text-gray-600">Status:</div>
              <div>
                {validationResult ? (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(validationResult.status)}`}>
                    {validationResult.status}
                  </span>
                ) : (
                  'Not validated'
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Uploaded Documents</h2>
          <div className="bg-white rounded-lg overflow-hidden border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claim.uploaded_documents.map((doc, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {dischargeSummary && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Discharge Summary</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <textarea
                className="w-full h-64 p-3 border border-gray-300 rounded-md"
                value={dischargeSummary}
                onChange={(e) => setDischargeSummary(e.target.value)}
                placeholder="Generated discharge summary will appear here..."
              />
            </div>
          </div>
        )}

        {validationResult && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Validation Results</h2>
            <div className={`p-4 rounded-md ${validationResult.status === 'PASS' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full mr-2 ${getStatusColor(validationResult.status)}`}>
                  {validationResult.status}
                </span>
                <span className="font-medium">{validationResult.notes}</span>
              </div>
              
              {validationResult.missingDocuments.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-medium mb-1">Missing or Incomplete Documents:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {validationResult.missingDocuments.map((doc, index) => (
                      <li key={index}>{doc.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResult.issues.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-medium mb-1">Issues:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {validationResult.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}