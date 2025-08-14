'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DocumentStatus } from '@/types/documentTypes';

interface DocumentInput {
  name: string;
  type: string;
  status?: DocumentStatus | 'VALID';
}

interface ValidationResult {
  missing: string[];
  issues: string[];
  status: 'PASS' | 'FAIL';
  notes: string;
}

export default function DocumentValidation() {
  const { token } = useAuth();
  const [insurerName, setInsurerName] = useState('');
  const [claimType, setClaimType] = useState('Cashless Hospitalization');
  const [documents, setDocuments] = useState<DocumentInput[]>([
    { name: '', type: '', status: 'VALID' }
  ]);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add a new document input field
  const addDocument = () => {
    setDocuments([...documents, { name: '', type: '', status: 'VALID' }]);
  };

  // Remove a document input field
  const removeDocument = (index: number) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    setDocuments(newDocuments);
  };

  // Update document field values
  const updateDocument = (index: number, field: keyof DocumentInput, value: string) => {
    const newDocuments = [...documents];
    newDocuments[index] = { ...newDocuments[index], [field]: value };
    setDocuments(newDocuments);
  };

  // Submit the form to validate documents
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Validate form
      if (!insurerName.trim()) {
        throw new Error('Insurer name is required');
      }

      if (!claimType.trim()) {
        throw new Error('Claim type is required');
      }

      // Filter out empty document entries
      const validDocuments = documents.filter(doc => doc.name.trim() !== '');

      if (validDocuments.length === 0) {
        throw new Error('At least one document is required');
      }

      // Call the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/validation/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          insurerName,
          claimType,
          uploadedDocuments: validDocuments
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate documents');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Insurance Claim Document Validation</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Insurer Name</label>
            <input
              type="text"
              value={insurerName}
              onChange={(e) => setInsurerName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter insurer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Claim Type</label>
            <select
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Cashless Hospitalization">Cashless Hospitalization</option>
              <option value="Reimbursement">Reimbursement</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Documents</h2>
          
          {documents.map((doc, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded">
              <div>
                <label className="block text-sm font-medium mb-1">Document Name</label>
                <input
                  type="text"
                  value={doc.name}
                  onChange={(e) => updateDocument(index, 'name', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Patient ID Proof"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Document Type</label>
                <input
                  type="text"
                  value={doc.type}
                  onChange={(e) => updateDocument(index, 'type', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., id_proof"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={doc.status}
                  onChange={(e) => updateDocument(index, 'status', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="VALID">Valid</option>
                  <option value="UNCLEAR">Unclear</option>
                  <option value="INCOMPLETE">Incomplete</option>
                  <option value="MISMATCHED">Mismatched</option>
                </select>

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="mt-2 text-red-500 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addDocument}
            className="mt-2 text-blue-500 text-sm"
          >
            + Add Another Document
          </button>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Validating...' : 'Validate Documents'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-4">Validation Result</h2>
          
          <div className="mb-4">
            <span className="font-medium">Status: </span>
            <span className={`font-bold ${result.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
              {result.status}
            </span>
          </div>
          
          <div className="mb-4">
            <span className="font-medium">Notes: </span>
            <span>{result.notes}</span>
          </div>

          {result.missing.length > 0 && (
            <div className="mb-4">
              <span className="font-medium">Missing Documents: </span>
              <ul className="list-disc pl-5 mt-1">
                {result.missing.map((doc, index) => (
                  <li key={index} className="text-red-600">{doc}</li>
                ))}
              </ul>
            </div>
          )}

          {result.issues.length > 0 && (
            <div>
              <span className="font-medium">Document Issues: </span>
              <ul className="list-disc pl-5 mt-1">
                {result.issues.map((issue, index) => (
                  <li key={index} className="text-orange-600">{issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}