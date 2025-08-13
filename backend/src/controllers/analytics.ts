import { Request, Response } from 'express';
import pool from '../config/database';
import { ClaimStatus } from '../models/claim';

// Get total claims count
export const getTotalClaims = async (req: Request, res: Response) => {
  try {
    const { hospital_id } = req.params;
    
    const query = 'SELECT COUNT(*) as total FROM claims WHERE hospital_id = $1';
    const result = await pool.query(query, [hospital_id]);
    
    res.status(200).json({
      total: parseInt(result.rows[0].total)
    });
  } catch (error) {
    console.error('Get total claims error:', error);
    res.status(500).json({ message: 'Server error while fetching total claims' });
  }
};

// Get approval rate
export const getApprovalRate = async (req: Request, res: Response) => {
  try {
    const { hospital_id } = req.params;
    
    // Get total claims that are not in draft status
    const totalQuery = `
      SELECT COUNT(*) as total 
      FROM claims 
      WHERE hospital_id = $1 AND status != $2
    `;
    const totalResult = await pool.query(totalQuery, [hospital_id, ClaimStatus.DRAFT]);
    const total = parseInt(totalResult.rows[0].total);
    
    // Get approved and paid claims
    const approvedQuery = `
      SELECT COUNT(*) as approved 
      FROM claims 
      WHERE hospital_id = $1 AND (status = $2 OR status = $3)
    `;
    const approvedResult = await pool.query(approvedQuery, [
      hospital_id, 
      ClaimStatus.APPROVED, 
      ClaimStatus.PAID
    ]);
    const approved = parseInt(approvedResult.rows[0].approved);
    
    // Calculate approval rate
    const approvalRate = total > 0 ? (approved / total) * 100 : 0;
    
    res.status(200).json({
      total,
      approved,
      approvalRate: Math.round(approvalRate * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Get approval rate error:', error);
    res.status(500).json({ message: 'Server error while calculating approval rate' });
  }
};

// Get average processing time (from submission to approval)
export const getAverageProcessingTime = async (req: Request, res: Response) => {
  try {
    const { hospital_id } = req.params;
    
    const query = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) as avg_days
      FROM claims 
      WHERE 
        hospital_id = $1 AND 
        (status = $2 OR status = $3) AND
        updated_at IS NOT NULL
    `;
    
    const result = await pool.query(query, [
      hospital_id, 
      ClaimStatus.APPROVED, 
      ClaimStatus.PAID
    ]);
    
    const avgDays = result.rows[0].avg_days || 0;
    
    res.status(200).json({
      averageProcessingDays: Math.round(avgDays * 10) / 10 // Round to 1 decimal place
    });
  } catch (error) {
    console.error('Get average processing time error:', error);
    res.status(500).json({ message: 'Server error while calculating average processing time' });
  }
};

// Get claims by status
export const getClaimsByStatus = async (req: Request, res: Response) => {
  try {
    const { hospital_id } = req.params;
    
    const query = `
      SELECT status, COUNT(*) as count
      FROM claims
      WHERE hospital_id = $1
      GROUP BY status
    `;
    
    const result = await pool.query(query, [hospital_id]);
    
    // Create a map of all statuses with count 0
    const statusCounts: Record<string, number> = Object.values(ClaimStatus).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {}
    );
    
    // Update counts from query results
    result.rows.forEach(row => {
      statusCounts[row.status] = parseInt(row.count);
    });
    
    res.status(200).json({ statusCounts });
  } catch (error) {
    console.error('Get claims by status error:', error);
    res.status(500).json({ message: 'Server error while fetching claims by status' });
  }
};

// Get dashboard analytics
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const { hospital_id } = req.params;
    
    // Get total claims
    const totalQuery = 'SELECT COUNT(*) as total FROM claims WHERE hospital_id = $1';
    const totalResult = await pool.query(totalQuery, [hospital_id]);
    const totalClaims = parseInt(totalResult.rows[0].total);
    
    // Get claims by status
    const statusQuery = `
      SELECT status, COUNT(*) as count
      FROM claims
      WHERE hospital_id = $1
      GROUP BY status
    `;
    const statusResult = await pool.query(statusQuery, [hospital_id]);
    
    // Create a map of all statuses with count 0
    const statusCounts: Record<string, number> = Object.values(ClaimStatus).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {}
    );
    
    // Update counts from query results
    statusResult.rows.forEach(row => {
      statusCounts[row.status] = parseInt(row.count);
    });
    
    // Calculate approval rate
    const totalProcessed = totalClaims - statusCounts[ClaimStatus.DRAFT];
    const approved = statusCounts[ClaimStatus.APPROVED] + statusCounts[ClaimStatus.PAID];
    const approvalRate = totalProcessed > 0 ? (approved / totalProcessed) * 100 : 0;
    
    // Get average processing time
    const avgTimeQuery = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) as avg_days
      FROM claims 
      WHERE 
        hospital_id = $1 AND 
        (status = $2 OR status = $3) AND
        updated_at IS NOT NULL
    `;
    
    const avgTimeResult = await pool.query(avgTimeQuery, [
      hospital_id, 
      ClaimStatus.APPROVED, 
      ClaimStatus.PAID
    ]);
    
    const avgDays = avgTimeResult.rows[0].avg_days || 0;
    
    // Get claims with missing documents
    const missingDocsQuery = `
      SELECT c.id, c.patient_name, c.insurer, c.status
      FROM claims c
      WHERE c.hospital_id = $1 AND c.status != $2 AND c.status != $3
      ORDER BY c.created_at DESC
      LIMIT 5
    `;
    
    const missingDocsResult = await pool.query(missingDocsQuery, [
      hospital_id,
      ClaimStatus.APPROVED,
      ClaimStatus.PAID
    ]);
    
    // Get recently approved claims
    const recentApprovedQuery = `
      SELECT id, patient_name, insurer, updated_at
      FROM claims
      WHERE hospital_id = $1 AND status = $2
      ORDER BY updated_at DESC
      LIMIT 5
    `;
    
    const recentApprovedResult = await pool.query(recentApprovedQuery, [
      hospital_id,
      ClaimStatus.APPROVED
    ]);
    
    res.status(200).json({
      totalClaims,
      statusCounts,
      approvalRate: Math.round(approvalRate * 10) / 10,
      averageProcessingDays: Math.round(avgDays * 10) / 10,
      claimsWithMissingDocs: missingDocsResult.rows,
      recentlyApproved: recentApprovedResult.rows
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard analytics' });
  }
};