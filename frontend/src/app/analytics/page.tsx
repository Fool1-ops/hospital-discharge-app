'use client';

import { useState, useEffect } from 'react';
import { Claim } from '@/data/mockClaims';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface AnalyticsData {
  totalClaims: number;
  passCount: number;
  failCount: number;
  passRate: number;
  avgMissingDocs: number;
  claimsByStatus: {
    status: string;
    count: number;
  }[];
  claimsByInsurer: {
    insurer: string;
    count: number;
  }[];
}

export default function AnalyticsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch mock claims data
        const response = await fetch('/api/mock-claims');
        if (!response.ok) {
          throw new Error('Failed to fetch claims');
        }
        const claimsData = await response.json();
        setClaims(claimsData);

        // Calculate analytics from claims data
        calculateAnalytics(claimsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const calculateAnalytics = (claimsData: Claim[]) => {
    // Total claims
    const totalClaims = claimsData.length;

    // Calculate PASS/FAIL counts and rate
    const passClaims = claimsData.filter(claim => 
      claim.uploaded_documents.every(doc => doc.status === 'COMPLETE')
    );
    const passCount = passClaims.length;
    const failCount = totalClaims - passCount;
    const passRate = totalClaims > 0 ? (passCount / totalClaims) * 100 : 0;

    // Calculate average missing documents per claim
    let totalMissingDocs = 0;
    claimsData.forEach(claim => {
      const missingDocs = claim.uploaded_documents.filter(doc => 
        doc.status === 'MISSING' || doc.status === 'INCOMPLETE'
      ).length;
      totalMissingDocs += missingDocs;
    });
    const avgMissingDocs = totalClaims > 0 ? totalMissingDocs / totalClaims : 0;

    // Claims by status (PASS/FAIL)
    const claimsByStatus = [
      { status: 'PASS', count: passCount },
      { status: 'FAIL', count: failCount }
    ];

    // Claims by insurer
    const insurerCounts: Record<string, number> = {};
    claimsData.forEach(claim => {
      const insurer = claim.insurer || 'Unknown';
      insurerCounts[insurer] = (insurerCounts[insurer] || 0) + 1;
    });

    // Format for chart data
    const claimsByInsurer = Object.entries(insurerCounts)
      .map(([insurer, count]) => ({
        insurer,
        count
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    setAnalyticsData({
      totalClaims,
      passCount,
      failCount,
      passRate,
      avgMissingDocs,
      claimsByStatus,
      claimsByInsurer
    });
  };

  // Helper function to get color for status
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
      case 'COMPLETE':
        return '#10B981'; // green-500
      case 'UNCLEAR':
        return '#F59E0B'; // yellow-500
      case 'FAIL':
      case 'MISSING':
      case 'INCOMPLETE':
        return '#EF4444'; // red-500
      case 'MISMATCHED':
        return '#F97316'; // orange-500
      default:
        return '#6B7280'; // gray-500
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

  // COLORS for charts
  const COLORS = {
    pass: '#10B981',  // green
    fail: '#EF4444',  // red
    unclear: '#F59E0B', // yellow
    mismatched: '#F97316', // orange
    blue: '#3B82F6',  // blue
    purple: '#8B5CF6', // purple
    pink: '#EC4899',  // pink
    indigo: '#6366F1', // indigo
    cyan: '#06B6D4',  // cyan
    teal: '#14B8A6',  // teal
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{name: string; value: number}>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-medium">{`${label || payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Claims Analytics Dashboard</h1>

      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Claims Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Claims</h2>
            <p className="text-4xl font-bold text-blue-600">{analyticsData.totalClaims}</p>
          </div>

          {/* PASS/FAIL Counts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">PASS Rate</h2>
            <p className="text-4xl font-bold text-green-600">{analyticsData.passRate.toFixed(1)}%</p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-green-600">PASS: {analyticsData.passCount}</span>
              <span className="text-red-600">FAIL: {analyticsData.failCount}</span>
            </div>
          </div>

          {/* Avg Missing Docs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Avg. Missing Docs</h2>
            <p className="text-4xl font-bold text-orange-600">{analyticsData.avgMissingDocs.toFixed(1)}</p>
            <p className="text-sm text-gray-500 mt-2">Per claim</p>
          </div>

          {/* Total Insurers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Insurers</h2>
            <p className="text-4xl font-bold text-purple-600">{analyticsData.claimsByInsurer.length}</p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* PASS/FAIL Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Claims by Status</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.claimsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.claimsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.status === 'PASS' ? COLORS.pass : COLORS.fail} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Claims by Insurer Bar Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Claims by Insurer</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.claimsByInsurer}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="insurer" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" name="Claims" fill={COLORS.blue} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Claims Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Recent Claims</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Claim ID</th>
                <th className="py-3 px-4 text-left">Patient</th>
                <th className="py-3 px-4 text-left">Insurer</th>
                <th className="py-3 px-4 text-left">Admission Date</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.slice(0, 5).map((claim) => {
                // Determine claim status based on documents
                const allComplete = claim.uploaded_documents.every(doc => doc.status === 'COMPLETE');
                
                let status = allComplete ? 'PASS' : 'FAIL';
                let statusColor = allComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                // Check if there are any unclear documents
                const hasUnclear = claim.uploaded_documents.some(doc => doc.status === 'UNCLEAR');
                
                if (hasUnclear) {
                  status = 'Needs Review';
                  statusColor = 'bg-yellow-100 text-yellow-800';
                }
                
                return (
                  <tr key={claim.claim_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">{claim.claim_id}</td>
                    <td className="py-3 px-4">{claim.patient_name}</td>
                    <td className="py-3 px-4">{claim.insurer}</td>
                    <td className="py-3 px-4">{new Date(claim.admission_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}