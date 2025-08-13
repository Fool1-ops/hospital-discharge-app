// API service for making authenticated requests

interface ApiOptions {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchApi(endpoint: string, options: ApiOptions = {}) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// File upload with multipart/form-data
export async function uploadFile(endpoint: string, formData: FormData) {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    fetchApi('/api/auth/login', { method: 'POST', body: { email, password } }),
  
  register: (userData: Record<string, unknown>) => 
    fetchApi('/api/auth/register', { method: 'POST', body: userData }),
  
  getProfile: () => 
    fetchApi('/api/auth/profile'),
};

// Claims API
export const claimsApi = {
  createClaim: (claimData: Record<string, unknown>) => 
    fetchApi('/api/claims', { method: 'POST', body: claimData }),
  
  getClaim: (id: string) => 
    fetchApi(`/api/claims/${id}`),
  
  getClaimsByHospital: (hospitalId: string) => 
    fetchApi(`/api/claims/hospital/${hospitalId}`),
  
  updateClaimStatus: (id: string, status: string) => 
    fetchApi(`/api/claims/${id}/status`, { method: 'PUT', body: { status } }),
  
  uploadDocument: (formData: FormData) => 
    uploadFile('/api/claims/documents', formData),
  
  getClaimDocuments: (claimId: string) => 
    fetchApi(`/api/claims/${claimId}/documents`),
  
  generateInsurerPacket: (claimId: string) => 
    fetchApi(`/api/claims/${claimId}/generate-packet`),
  
  getClaimsInProgress: (hospitalId: string) => 
    fetchApi(`/api/claims/hospital/${hospitalId}/in-progress`),
  
  getRecentlyApprovedClaims: (hospitalId: string) => 
    fetchApi(`/api/claims/hospital/${hospitalId}/recently-approved`),
};

// Analytics API
export const analyticsApi = {
  getDashboardAnalytics: (hospitalId: string) => 
    fetchApi(`/api/analytics/hospital/${hospitalId}/dashboard`),
  
  getTotalClaims: (hospitalId: string) => 
    fetchApi(`/api/analytics/hospital/${hospitalId}/total`),
  
  getApprovalRate: (hospitalId: string) => 
    fetchApi(`/api/analytics/hospital/${hospitalId}/approval-rate`),
  
  getAverageProcessingTime: (hospitalId: string) => 
    fetchApi(`/api/analytics/hospital/${hospitalId}/avg-processing-time`),
  
  getClaimsByStatus: (hospitalId: string) => 
    fetchApi(`/api/analytics/hospital/${hospitalId}/by-status`),
};