'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Claim } from '@/data/mockClaims';
import { getStatusColor } from '@/utils/statusHelpers';

interface ValidationResult {
  missingDocuments: string[];
  issues: string[];
  status: 'PASS' | 'FAIL';
  notes: string;
}

export default function ClaimValidationPage() {
  const params = useParams();
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Initial mock validation
        performValidation(foundClaim);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchClaim();
  }, [params.id]);

  const performValidation = async (claimData: Claim) => {
    setValidating(true);
    
    try {
      // Optimistic UI update - show validating state immediately
      setValidationResult(prev => prev ? {
        ...prev,
        status: 'PASS', // Optimistic assumption
        notes: 'Validating documents...'
      } : null);
      
      // Prepare the payload for validation API
      const payload = {
        claimId: claimData.claim_id,
        documents: claimData.uploaded_documents.map(doc => ({
          name: doc.name,
          type: doc.type,
          status: doc.status
        }))
      };
      
      // Call validation API
      // In a real implementation, this would call the backend API
      // const response = await fetch('/api/validation/validate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Validation API failed');
      // }
      // 
      // const result = await response.json();
      // setValidationResult(result);
      
      // For now, use mock validation logic
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
    } catch (err) {
      setError('Validation failed. Please try again.');
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!claim || !validationResult) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Notice: </strong>
        <span className="block sm:inline">Claim or validation result not found.</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <button 
          onClick={() => router.push(`/claims/${claim?.claim_id}`)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Claim Details
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Claim Validation: {claim?.claim_id}</h1>
          <button
            onClick={() => performValidation(claim!)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={validating}
          >
            {validating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </span>
            ) : 'Re-run Validation'}
          </button>
        </div>
        
        {claim && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-3">Patient Information</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">Name:</div>
                <div>{claim.patient_name}</div>
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
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Uploaded Documents</h2>
          {claim && (
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
          )}
        </div>

        {validating ? (
          <div className="flex justify-center items-center h-32 bg-gray-50 rounded-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg font-medium text-gray-700">Validating documents...</span>
          </div>
        ) : validationResult ? (
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
        ) : null}
      </div>
    </div>
  );
}