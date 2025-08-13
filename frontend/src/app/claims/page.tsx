'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Claim } from '@/data/mockClaims';
import { getStatusColor } from '@/utils/statusHelpers';

export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClaims() {
      try {
        const response = await fetch('/api/mock-claims');
        if (!response.ok) {
          throw new Error('Failed to fetch claims');
        }
        const data = await response.json();
        setClaims(data);
        setFilteredClaims(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading claims data');
        setLoading(false);
        console.error(err);
      }
    }

    fetchClaims();
  }, []);

  // Filter claims when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClaims(claims);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = claims.filter(claim => 
      claim.patient_name.toLowerCase().includes(term) || 
      claim.claim_id.toLowerCase().includes(term)
    );
    
    setFilteredClaims(filtered);
  }, [searchTerm, claims]);
  
  // Calculate validation status for each claim
  const getClaimStatus = (claim: Claim): 'PASS' | 'FAIL' => {
    const hasIssues = claim.uploaded_documents.some(doc => 
      doc.status !== 'COMPLETE'
    );
    return hasIssues ? 'FAIL' : 'PASS';
  };

  // Function to determine validation status based on document statuses
  const getValidationStatus = (claim: Claim): 'PASS' | 'FAIL' => {
    return getClaimStatus(claim);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Insurance Claims</h1>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by patient name or claim ID..."
            className="w-full p-3 border border-gray-300 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-red-500 bg-red-50 rounded-lg shadow">{error}</div>
      ) : filteredClaims.length === 0 ? (
        <div className="p-6 text-gray-500 bg-white rounded-lg shadow text-center">No claims found matching your search</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discharge Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClaims.map((claim) => {
                  const validationStatus = getValidationStatus(claim);
                  return (
                    <tr 
                      key={claim.claim_id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/claims/${claim.claim_id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.claim_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.patient_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.insurer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(claim.admission_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(claim.discharge_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(validationStatus)}`}>
                          {validationStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETE':
      return 'bg-green-100 text-green-800';
    case 'UNCLEAR':
      return 'bg-yellow-100 text-yellow-800';
    case 'INCOMPLETE':
      return 'bg-orange-100 text-orange-800';
    case 'MISMATCHED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}